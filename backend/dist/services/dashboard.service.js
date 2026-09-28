"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectDashboard = exports.getDashboardSummary = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Supplier_model_1 = __importDefault(require("../models/Supplier.model"));
const PurchaseOrder_model_1 = __importDefault(require("../models/PurchaseOrder.model"));
const Inventory_model_1 = __importDefault(require("../models/Inventory.model"));
const WasteRecord_model_1 = __importDefault(require("../models/WasteRecord.model"));
const ConsumptionPlan_model_1 = __importDefault(require("../models/ConsumptionPlan.model"));
const getAverageUnitPrice = async (materialId) => {
    const purchaseOrders = await PurchaseOrder_model_1.default.find({
        'items.materialId': materialId,
        status: { $in: ['approved', 'partially_received', 'received'] },
    });
    if (purchaseOrders.length === 0)
        return 0;
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
const getDashboardSummary = async (projectId) => {
    const projectFilter = projectId ? { _id: projectId } : {};
    const projects = await Project_model_1.default.find(projectFilter);
    const projectIds = projects.map(p => p._id.toString());
    const totalProjects = await Project_model_1.default.countDocuments(projectFilter);
    const activeProjects = await Project_model_1.default.countDocuments({ ...projectFilter, status: 'active' });
    const completedProjects = await Project_model_1.default.countDocuments({ ...projectFilter, status: 'completed' });
    const totalMaterials = await Material_model_1.default.countDocuments({ isActive: true });
    const totalSuppliers = await Supplier_model_1.default.countDocuments({ isActive: true });
    const poFilter = projectId ? { projectId } : {};
    const totalPOs = await PurchaseOrder_model_1.default.countDocuments(poFilter);
    const approvedPOs = await PurchaseOrder_model_1.default.countDocuments({ ...poFilter, status: 'approved' });
    const receivedPOs = await PurchaseOrder_model_1.default.countDocuments({ ...poFilter, status: 'received' });
    const inventoryFilter = projectId ? { projectId: { $in: projectIds } } : {};
    const inventoryItems = await Inventory_model_1.default.find(inventoryFilter);
    const totalInventoryValue = await Promise.all(inventoryItems.map(async (item) => {
        const avgPrice = await getAverageUnitPrice(item.materialId.toString());
        return item.currentStock * avgPrice;
    })).then(values => values.reduce((sum, val) => sum + val, 0));
    const lowStockItems = await Promise.all(inventoryItems.map(async (item) => {
        const material = await Material_model_1.default.findById(item.materialId);
        if (material && item.currentStock <= material.reorderLevel) {
            return item;
        }
        return null;
    })).then(items => items.filter(i => i !== null));
    const wasteFilter = projectId ? { projectId: { $in: projectIds } } : {};
    const wasteRecords = await WasteRecord_model_1.default.find(wasteFilter);
    const totalWasteCost = wasteRecords.reduce((sum, record) => sum + record.costImpact, 0);
    const consumptionFilter = projectId ? { projectId: { $in: projectIds } } : {};
    const consumptionPlans = await ConsumptionPlan_model_1.default.find(consumptionFilter);
    const totalPlannedCost = consumptionPlans.reduce((sum, plan) => sum + (plan.plannedQuantity * plan.plannedUnitCost), 0);
    const totalActualCost = consumptionPlans.reduce((sum, plan) => sum + (plan.actualQuantity * plan.actualUnitCost), 0);
    const recentPOs = await PurchaseOrder_model_1.default.find(poFilter)
        .populate('supplierId', 'name')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
    const recentWaste = await WasteRecord_model_1.default.find(wasteFilter)
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
    };
};
exports.getDashboardSummary = getDashboardSummary;
const getProjectDashboard = async (projectId) => {
    const project = await Project_model_1.default.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }
    const summary = await (0, exports.getDashboardSummary)(projectId);
    const inventoryItems = await Inventory_model_1.default.find({ projectId });
    const materialBreakdown = await Promise.all(inventoryItems.map(async (item) => {
        const material = await Material_model_1.default.findById(item.materialId);
        return {
            materialName: material?.name || 'Unknown',
            currentStock: item.currentStock,
            reorderLevel: material?.reorderLevel || 0,
            isLowStock: item.currentStock <= (material?.reorderLevel || 0),
        };
    }));
    const purchaseOrders = await PurchaseOrder_model_1.default.find({ projectId })
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
exports.getProjectDashboard = getProjectDashboard;
//# sourceMappingURL=dashboard.service.js.map