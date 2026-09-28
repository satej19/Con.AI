"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVarianceReport = exports.getVarianceAnalysis = exports.updateConsumptionPlan = exports.getConsumptionPlanById = exports.getAllConsumptionPlans = exports.createConsumptionPlan = void 0;
const ConsumptionPlan_model_1 = __importDefault(require("../models/ConsumptionPlan.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const createConsumptionPlan = async (input, userId) => {
    const material = await Material_model_1.default.findById(input.materialId);
    if (!material) {
        throw new AppError_1.AppError('Material not found', 404);
    }
    const project = await Project_model_1.default.findById(input.projectId);
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    const existingPlan = await ConsumptionPlan_model_1.default.findOne({
        projectId: input.projectId,
        materialId: input.materialId,
        period: input.period,
    });
    if (existingPlan) {
        throw new AppError_1.AppError('Consumption plan already exists for this project, material, and period', 409);
    }
    const consumptionPlan = await ConsumptionPlan_model_1.default.create({
        projectId: input.projectId,
        materialId: input.materialId,
        plannedQuantity: input.plannedQuantity,
        actualQuantity: 0,
        plannedUnitCost: input.plannedUnitCost,
        actualUnitCost: 0,
        period: input.period,
        notes: input.notes,
        createdBy: userId,
    });
    return consumptionPlan;
};
exports.createConsumptionPlan = createConsumptionPlan;
const getAllConsumptionPlans = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { projectId, period } = query;
    const filter = {};
    if (projectId) {
        filter.projectId = projectId;
    }
    if (period) {
        filter.period = period;
    }
    const consumptionPlans = await ConsumptionPlan_model_1.default.find(filter)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code')
        .sort({ period: -1 })
        .skip(skip)
        .limit(limit);
    const total = await ConsumptionPlan_model_1.default.countDocuments(filter);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { consumptionPlans, meta };
};
exports.getAllConsumptionPlans = getAllConsumptionPlans;
const getConsumptionPlanById = async (id) => {
    const consumptionPlan = await ConsumptionPlan_model_1.default.findById(id)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code');
    if (!consumptionPlan) {
        throw new AppError_1.AppError('Consumption plan not found', 404);
    }
    return consumptionPlan;
};
exports.getConsumptionPlanById = getConsumptionPlanById;
const updateConsumptionPlan = async (id, input) => {
    const consumptionPlan = await ConsumptionPlan_model_1.default.findById(id);
    if (!consumptionPlan) {
        throw new AppError_1.AppError('Consumption plan not found', 404);
    }
    if (input.actualQuantity !== undefined) {
        consumptionPlan.actualQuantity = input.actualQuantity;
    }
    if (input.actualUnitCost !== undefined) {
        consumptionPlan.actualUnitCost = input.actualUnitCost;
    }
    if (input.notes !== undefined) {
        consumptionPlan.notes = input.notes;
    }
    await consumptionPlan.save();
    return consumptionPlan;
};
exports.updateConsumptionPlan = updateConsumptionPlan;
const getVarianceAnalysis = async (id) => {
    const consumptionPlan = await ConsumptionPlan_model_1.default.findById(id)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code');
    if (!consumptionPlan) {
        throw new AppError_1.AppError('Consumption plan not found', 404);
    }
    const quantityVariance = consumptionPlan.actualQuantity - consumptionPlan.plannedQuantity;
    const quantityVariancePct = consumptionPlan.plannedQuantity > 0
        ? (quantityVariance / consumptionPlan.plannedQuantity) * 100
        : 0;
    const plannedCost = consumptionPlan.plannedQuantity * consumptionPlan.plannedUnitCost;
    const actualCost = consumptionPlan.actualQuantity * consumptionPlan.actualUnitCost;
    const costVariance = actualCost - plannedCost;
    const costVariancePct = plannedCost > 0 ? (costVariance / plannedCost) * 100 : 0;
    const variance = {
        quantityVariance,
        quantityVariancePct,
        plannedCost,
        actualCost,
        costVariance,
        costVariancePct,
    };
    const planObj = consumptionPlan.toObject();
    return { ...planObj, variance };
};
exports.getVarianceAnalysis = getVarianceAnalysis;
const getVarianceReport = async (projectId, period) => {
    const filter = { projectId };
    if (period) {
        filter.period = period;
    }
    const consumptionPlans = await ConsumptionPlan_model_1.default.find(filter)
        .populate('materialId', 'name code unit')
        .sort({ materialId: 1 });
    const report = consumptionPlans.map(plan => {
        const quantityVariance = plan.actualQuantity - plan.plannedQuantity;
        const quantityVariancePct = plan.plannedQuantity > 0
            ? (quantityVariance / plan.plannedQuantity) * 100
            : 0;
        const plannedCost = plan.plannedQuantity * plan.plannedUnitCost;
        const actualCost = plan.actualQuantity * plan.actualUnitCost;
        const costVariance = actualCost - plannedCost;
        const costVariancePct = plannedCost > 0 ? (costVariance / plannedCost) * 100 : 0;
        return {
            ...plan.toObject(),
            variance: {
                quantityVariance,
                quantityVariancePct,
                plannedCost,
                actualCost,
                costVariance,
                costVariancePct,
            },
        };
    });
    const totalPlannedCost = report.reduce((sum, item) => sum + item.variance.plannedCost, 0);
    const totalActualCost = report.reduce((sum, item) => sum + item.variance.actualCost, 0);
    const totalCostVariance = totalActualCost - totalPlannedCost;
    const totalCostVariancePct = totalPlannedCost > 0 ? (totalCostVariance / totalPlannedCost) * 100 : 0;
    return {
        items: report,
        summary: {
            totalPlannedCost,
            totalActualCost,
            totalCostVariance,
            totalCostVariancePct,
        },
    };
};
exports.getVarianceReport = getVarianceReport;
//# sourceMappingURL=consumption.service.js.map