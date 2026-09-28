"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEOQAnalysis = exports.getSDEClassification = exports.getABCClassification = exports.getCostAnalysis = void 0;
const Material_model_1 = __importDefault(require("../models/Material.model"));
const PurchaseOrder_model_1 = __importDefault(require("../models/PurchaseOrder.model"));
const InventoryTransaction_model_1 = __importDefault(require("../models/InventoryTransaction.model"));
const WasteRecord_model_1 = __importDefault(require("../models/WasteRecord.model"));
const getCostAnalysis = async (projectId, startDate, endDate) => {
    const dateFilter = {};
    if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate)
            dateFilter.date.$gte = new Date(startDate);
        if (endDate)
            dateFilter.date.$lte = new Date(endDate);
    }
    const purchaseOrders = await PurchaseOrder_model_1.default.find({
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
    const wasteRecords = await WasteRecord_model_1.default.find({
        projectId,
    });
    let totalWaste = 0;
    let totalWasteCost = 0;
    for (const waste of wasteRecords) {
        totalWaste += waste.quantity;
        totalWasteCost += waste.costImpact;
    }
    const inventoryTransactions = await InventoryTransaction_model_1.default.find({
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
exports.getCostAnalysis = getCostAnalysis;
const getCostByCategory = async (projectId) => {
    const materials = await Material_model_1.default.find({ isActive: true });
    const categoryMap = new Map();
    for (const material of materials) {
        categoryMap.set(material.category, { quantity: 0, cost: 0 });
    }
    const purchaseOrders = await PurchaseOrder_model_1.default.find({
        projectId,
        status: { $in: ['approved', 'partially_received', 'received'] },
    });
    for (const po of purchaseOrders) {
        for (const item of po.items) {
            const material = await Material_model_1.default.findById(item.materialId);
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
const getABCClassification = async (projectId) => {
    const inventoryTransactions = await InventoryTransaction_model_1.default.find({
        projectId,
        type: 'ISSUE',
    });
    const materialConsumption = new Map();
    for (const transaction of inventoryTransactions) {
        const material = await Material_model_1.default.findById(transaction.materialId);
        if (material) {
            const current = materialConsumption.get(material._id.toString()) || 0;
            materialConsumption.set(material._id.toString(), current + transaction.quantity);
        }
    }
    const materials = await Material_model_1.default.find({ _id: { $in: Array.from(materialConsumption.keys()) } });
    const results = [];
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
        }
        else if (cumulativePercentage <= 90) {
            item.classification = 'B';
        }
        else {
            item.classification = 'C';
        }
    }
    return results;
};
exports.getABCClassification = getABCClassification;
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
const getSDEClassification = async (_projectId) => {
    const materials = await Material_model_1.default.find({ isActive: true });
    const results = [];
    for (const material of materials) {
        const scarcity = await determineScarcity(material._id.toString());
        const difficulty = await determineDifficulty(material._id.toString());
        let classification;
        if (scarcity === 'scarce' && difficulty === 'difficult')
            classification = 'SD';
        else if (scarcity === 'scarce' && difficulty === 'easy')
            classification = 'SE';
        else if (scarcity === 'available' && difficulty === 'difficult')
            classification = 'DN';
        else
            classification = 'NE';
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
exports.getSDEClassification = getSDEClassification;
const determineScarcity = async (materialId) => {
    const suppliers = await PurchaseOrder_model_1.default.aggregate([
        { $match: { 'items.materialId': materialId } },
        { $group: { _id: '$supplierId', count: { $sum: 1 } } },
    ]);
    return suppliers.length <= 1 ? 'scarce' : 'available';
};
const determineDifficulty = async (materialId) => {
    const materials = await Material_model_1.default.findById(materialId);
    if (!materials)
        return 'easy';
    const difficultCategories = ['chemical', 'electrical', 'valve'];
    return difficultCategories.includes(materials.category) ? 'difficult' : 'easy';
};
const getEOQAnalysis = async (projectId) => {
    const materials = await Material_model_1.default.find({ isActive: true });
    const results = [];
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
exports.getEOQAnalysis = getEOQAnalysis;
const getAnnualDemand = async (materialId, projectId) => {
    const transactions = await InventoryTransaction_model_1.default.find({
        projectId,
        materialId,
        type: 'ISSUE',
    });
    const totalIssued = transactions.reduce((sum, t) => sum + t.quantity, 0);
    return totalIssued * 12;
};
//# sourceMappingURL=analytics.service.js.map