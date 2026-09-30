import Project from '../models/Project.model';
import Material from '../models/Material.model';
import Supplier from '../models/Supplier.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import Inventory from '../models/Inventory.model';
import WasteRecord from '../models/WasteRecord.model';
import ConsumptionPlan from '../models/ConsumptionPlan.model';

const getAverageUnitPrice = async (materialId: string): Promise<number> => {
  const purchaseOrders = await PurchaseOrder.find({
    'items.materialId': materialId,
    status: { $in: ['approved', 'partially_received', 'received'] },
  });

  if (purchaseOrders.length === 0) return 0;

  let totalQuantity = 0;
  let totalCost = 0;

  for (const po of purchaseOrders) {
    for (const item of po.items) {
      if (item.materialId.toString() === materialId) {
        totalQuantity += item.quantity;
        totalCost += item.quantity * item.unitPrice;
      }
    }
  }

  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
};

export const getDashboardSummary = async (projectId?: string): Promise<any> => {
  const projectFilter = projectId ? { _id: projectId } : {};
  const projects = await Project.find(projectFilter);
  const projectIds = projects.map(p => p._id.toString());

  const totalProjects = await Project.countDocuments(projectFilter);
  const activeProjects = await Project.countDocuments({ ...projectFilter, status: 'active' });
  const completedProjects = await Project.countDocuments({ ...projectFilter, status: 'completed' });

  const totalMaterials = await Material.countDocuments({ isActive: true });
  const totalSuppliers = await Supplier.countDocuments({ isActive: true });

  const poFilter = projectId ? { projectId } : {};
  const totalPOs = await PurchaseOrder.countDocuments(poFilter);
  const approvedPOs = await PurchaseOrder.countDocuments({ ...poFilter, status: 'approved' });
  const receivedPOs = await PurchaseOrder.countDocuments({ ...poFilter, status: 'received' });

  const inventoryFilter = projectId ? { projectId: { $in: projectIds } } : {};
  const inventoryItems = await Inventory.find(inventoryFilter);
  const totalInventoryValue = await Promise.all(inventoryItems.map(async (item) => {
    const avgPrice = await getAverageUnitPrice(item.materialId.toString());
    return item.currentStock * avgPrice;
  })).then(values => values.reduce((sum, val) => sum + val, 0));

  const lowStockItems = await Promise.all(inventoryItems.map(async (item) => {
    const material = await Material.findById(item.materialId);
    if (material && item.currentStock <= material.reorderLevel) {
      return {
        _id: item._id,
        project: item.projectId,
        material: {
          _id: material._id,
          name: material.name,
          code: material.code,
          unit: material.unit,
          category: material.category,
          reorderLevel: material.reorderLevel,
        },
        currentStock: item.currentStock,
        lastUpdated: item.lastUpdated,
      };
    }
    return null;
  })).then(items => items.filter(i => i !== null));

  const wasteFilter = projectId ? { projectId: { $in: projectIds } } : {};
  const wasteRecords = await WasteRecord.find(wasteFilter);
  const totalWasteCost = wasteRecords.reduce((sum, record) => sum + record.costImpact, 0);

  const consumptionFilter = projectId ? { projectId: { $in: projectIds } } : {};
  const consumptionPlans = await ConsumptionPlan.find(consumptionFilter);
  const totalPlannedCost = consumptionPlans.reduce((sum, plan) => sum + (plan.plannedQuantity * plan.plannedUnitCost), 0);
  const totalActualCost = consumptionPlans.reduce((sum, plan) => sum + (plan.actualQuantity * plan.actualUnitCost), 0);

  const recentPOs = await PurchaseOrder.find(poFilter)
    .populate('supplierId', 'name')
    .populate('projectId', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentWaste = await WasteRecord.find(wasteFilter)
    .populate('materialId', 'name')
    .populate('projectId', 'name')
    .sort({ date: -1 })
    .limit(5);

  return {
    overview: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalMaterials,
      totalSuppliers,
      totalPOs,
      approvedPOs,
      receivedPOs,
    },
    inventory: {
      totalItems: inventoryItems.length,
      lowStockItems: lowStockItems.length,
      totalStock: totalInventoryValue,
    },
    financial: {
      totalWasteCost,
      totalPlannedCost,
      totalActualCost,
      costVariance: totalActualCost - totalPlannedCost,
    },
    recent: {
      purchaseOrders: recentPOs,
      wasteRecords: recentWaste,
    },
    lowStockItems,
  };
};

export const getProjectDashboard = async (projectId: string): Promise<any> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const summary = await getDashboardSummary(projectId);

  const inventoryItems = await Inventory.find({ projectId });
  const materialBreakdown = await Promise.all(inventoryItems.map(async (item) => {
    const material = await Material.findById(item.materialId);
    return {
      materialName: material?.name || 'Unknown',
      currentStock: item.currentStock,
      reorderLevel: material?.reorderLevel || 0,
      isLowStock: item.currentStock <= (material?.reorderLevel || 0),
    };
  }));

  const purchaseOrders = await PurchaseOrder.find({ projectId })
    .populate('supplierId', 'name')
    .sort({ createdAt: -1 });

  const pendingPOs = purchaseOrders.filter(po => po.status === 'draft' || po.status === 'approved').length;
  const completedPOs = purchaseOrders.filter(po => po.status === 'received').length;

  return {
    project: {
      id: project._id,
      name: project.name,
      code: project.code,
      status: project.status,
      budget: project.budget,
      location: project.location,
    },
    summary,
    materialBreakdown,
    purchaseOrderStats: {
      total: purchaseOrders.length,
      pending: pendingPOs,
      completed: completedPOs,
    },
  };
};
