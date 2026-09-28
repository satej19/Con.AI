import Material from '../models/Material.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import InventoryTransaction from '../models/InventoryTransaction.model';
import WasteRecord from '../models/WasteRecord.model';

interface ABCClassifiedItem {
  materialId: string;
  materialName: string;
  annualConsumptionValue: number;
  percentage: number;
  classification: 'A' | 'B' | 'C';
}

interface SDEClassifiedItem {
  materialId: string;
  materialName: string;
  scarcity: 'scarce' | 'available';
  difficulty: 'difficult' | 'easy';
  classification: 'SD' | 'SN' | 'SE' | 'DN' | 'DE' | 'NE';
}

interface EOQResult {
  materialId: string;
  materialName: string;
  annualDemand: number;
  orderingCost: number;
  holdingCost: number;
  eoq: number;
  totalCost: number;
}

export const getCostAnalysis = async (projectId: string, startDate?: string, endDate?: string): Promise<any> => {
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.date = {};
    if (startDate) dateFilter.date.$gte = new Date(startDate);
    if (endDate) dateFilter.date.$lte = new Date(endDate);
  }

  const purchaseOrders = await PurchaseOrder.find({
    projectId,
    status: { $in: ['approved', 'partially_received', 'received'] },
  });

  let totalOrdered = 0;
  let totalCost = 0;

  for (const po of purchaseOrders) {
    for (const item of po.items) {
      totalOrdered += item.quantity;
      totalCost += item.quantity * item.unitPrice;
    }
  }

  const wasteRecords = await WasteRecord.find({
    projectId,
  });

  let totalWaste = 0;
  let totalWasteCost = 0;

  for (const waste of wasteRecords) {
    totalWaste += waste.quantity;
    totalWasteCost += waste.costImpact;
  }

  const inventoryTransactions = await InventoryTransaction.find({
    projectId,
    type: 'ISSUE',
    ...dateFilter,
  });

  let totalIssued = 0;

  for (const transaction of inventoryTransactions) {
    totalIssued += transaction.quantity;
  }

  return {
    summary: {
      totalOrdered,
      totalOrderedCost: totalCost,
      totalIssued,
      totalWaste,
      totalWasteCost,
      wastePercentage: totalOrdered > 0 ? (totalWaste / totalOrdered) * 100 : 0,
    },
    byCategory: await getCostByCategory(projectId),
  };
};

const getCostByCategory = async (projectId: string): Promise<any[]> => {
  const materials = await Material.find({ isActive: true });
  const categoryMap = new Map<string, { quantity: number; cost: number }>();

  for (const material of materials) {
    categoryMap.set(material.category, { quantity: 0, cost: 0 });
  }

  const purchaseOrders = await PurchaseOrder.find({
    projectId,
    status: { $in: ['approved', 'partially_received', 'received'] },
  });

  for (const po of purchaseOrders) {
    for (const item of po.items) {
      const material = await Material.findById(item.materialId);
      if (material) {
        const category = material.category;
        const current = categoryMap.get(category) || { quantity: 0, cost: 0 };
        current.quantity += item.quantity;
        current.cost += item.quantity * item.unitPrice;
        categoryMap.set(category, current);
      }
    }
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    quantity: data.quantity,
    cost: data.cost,
  }));
};

export const getABCClassification = async (projectId: string): Promise<ABCClassifiedItem[]> => {
  const inventoryTransactions = await InventoryTransaction.find({
    projectId,
    type: 'ISSUE',
  });

  const materialConsumption = new Map<string, number>();

  for (const transaction of inventoryTransactions) {
    const material = await Material.findById(transaction.materialId);
    if (material) {
      const current = materialConsumption.get(material._id.toString()) || 0;
      materialConsumption.set(material._id.toString(), current + transaction.quantity);
    }
  }

  const materials = await Material.find({ _id: { $in: Array.from(materialConsumption.keys()) } });
  const results: ABCClassifiedItem[] = [];

  for (const material of materials) {
    const annualConsumption = materialConsumption.get(material._id.toString()) || 0;
    const averagePrice = await getAverageUnitPrice(material._id.toString());
    const annualConsumptionValue = annualConsumption * averagePrice;

    results.push({
      materialId: material._id.toString(),
      materialName: material.name,
      annualConsumptionValue,
      percentage: 0,
      classification: 'C',
    });
  }

  results.sort((a, b) => b.annualConsumptionValue - a.annualConsumptionValue);

  const totalValue = results.reduce((sum, item) => sum + item.annualConsumptionValue, 0);
  let cumulativeValue = 0;

  for (const item of results) {
    item.percentage = (item.annualConsumptionValue / totalValue) * 100;
    cumulativeValue += item.annualConsumptionValue;
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;

    if (cumulativePercentage <= 70) {
      item.classification = 'A';
    } else if (cumulativePercentage <= 90) {
      item.classification = 'B';
    } else {
      item.classification = 'C';
    }
  }

  return results;
};

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

export const getSDEClassification = async (_projectId: string): Promise<SDEClassifiedItem[]> => {
  const materials = await Material.find({ isActive: true });
  const results: SDEClassifiedItem[] = [];

  for (const material of materials) {
    const scarcity = await determineScarcity(material._id.toString());
    const difficulty = await determineDifficulty(material._id.toString());

    let classification: 'SD' | 'SN' | 'SE' | 'DN' | 'DE' | 'NE';
    if (scarcity === 'scarce' && difficulty === 'difficult') classification = 'SD';
    else if (scarcity === 'scarce' && difficulty === 'easy') classification = 'SE';
    else if (scarcity === 'available' && difficulty === 'difficult') classification = 'DN';
    else classification = 'NE';

    results.push({
      materialId: material._id.toString(),
      materialName: material.name,
      scarcity,
      difficulty,
      classification,
    });
  }

  return results;
};

const determineScarcity = async (materialId: string): Promise<'scarce' | 'available'> => {
  const suppliers = await PurchaseOrder.aggregate([
    { $match: { 'items.materialId': materialId } },
    { $group: { _id: '$supplierId', count: { $sum: 1 } } },
  ]);

  return suppliers.length <= 1 ? 'scarce' : 'available';
};

const determineDifficulty = async (materialId: string): Promise<'difficult' | 'easy'> => {
  const materials = await Material.findById(materialId);
  if (!materials) return 'easy';

  const difficultCategories = ['chemical', 'electrical', 'valve'];
  return difficultCategories.includes(materials.category) ? 'difficult' : 'easy';
};

export const getEOQAnalysis = async (projectId: string): Promise<EOQResult[]> => {
  const materials = await Material.find({ isActive: true });
  const results: EOQResult[] = [];

  for (const material of materials) {
    const annualDemand = await getAnnualDemand(material._id.toString(), projectId);
    const orderingCost = 100;
    const holdingCostRate = 0.25;
    const unitCost = await getAverageUnitPrice(material._id.toString());
    const holdingCost = unitCost * holdingCostRate;

    let eoq = 0;
    let totalCost = 0;

    if (annualDemand > 0 && orderingCost > 0 && holdingCost > 0) {
      eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
      totalCost = (annualDemand / eoq) * orderingCost + (eoq / 2) * holdingCost + annualDemand * unitCost;
    }

    results.push({
      materialId: material._id.toString(),
      materialName: material.name,
      annualDemand,
      orderingCost,
      holdingCost,
      eoq: Math.round(eoq),
      totalCost: Math.round(totalCost),
    });
  }

  return results;
};

const getAnnualDemand = async (materialId: string, projectId: string): Promise<number> => {
  const transactions = await InventoryTransaction.find({
    projectId,
    materialId,
    type: 'ISSUE',
  });

  const totalIssued = transactions.reduce((sum, t) => sum + t.quantity, 0);
  return totalIssued * 12;
};
