import ConsumptionPlan, { IConsumptionPlan } from '../models/ConsumptionPlan.model';
import Material from '../models/Material.model';
import Project from '../models/Project.model';
import { AppError } from '../utils/AppError';
import type { CreateConsumptionPlanInput, UpdateConsumptionPlanInput } from '../validators/consumption.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';

interface VarianceAnalysis {
  quantityVariance: number;
  quantityVariancePct: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePct: number;
}

export const createConsumptionPlan = async (input: CreateConsumptionPlanInput, userId: string): Promise<IConsumptionPlan> => {
  const material = await Material.findById(input.materialId);
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  const project = await Project.findById(input.projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const existingPlan = await ConsumptionPlan.findOne({
    projectId: input.projectId,
    materialId: input.materialId,
    period: input.period,
  });

  if (existingPlan) {
    throw new AppError('Consumption plan already exists for this project, material, and period', 409);
  }

  const consumptionPlan = await ConsumptionPlan.create({
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

export const getAllConsumptionPlans = async (query: any): Promise<{ consumptionPlans: IConsumptionPlan[]; meta: any }> => {
  const { page, limit, skip } = parsePagination(query);
  const { projectId, period } = query;

  const filter: any = {};
  if (projectId) {
    filter.projectId = projectId;
  }
  if (period) {
    filter.period = period;
  }

  const consumptionPlans = await ConsumptionPlan.find(filter)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code')
    .sort({ period: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ConsumptionPlan.countDocuments(filter);
  const meta = buildPaginationMeta(page, limit, total);

  return { consumptionPlans, meta };
};

export const getConsumptionPlanById = async (id: string): Promise<IConsumptionPlan> => {
  const consumptionPlan = await ConsumptionPlan.findById(id)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code');
  
  if (!consumptionPlan) {
    throw new AppError('Consumption plan not found', 404);
  }
  return consumptionPlan;
};

export const updateConsumptionPlan = async (id: string, input: UpdateConsumptionPlanInput): Promise<IConsumptionPlan> => {
  const consumptionPlan = await ConsumptionPlan.findById(id);
  if (!consumptionPlan) {
    throw new AppError('Consumption plan not found', 404);
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

export const getVarianceAnalysis = async (id: string): Promise<any> => {
  const consumptionPlan = await ConsumptionPlan.findById(id)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code');
  
  if (!consumptionPlan) {
    throw new AppError('Consumption plan not found', 404);
  }

  const quantityVariance = consumptionPlan.actualQuantity - consumptionPlan.plannedQuantity;
  const quantityVariancePct = consumptionPlan.plannedQuantity > 0 
    ? (quantityVariance / consumptionPlan.plannedQuantity) * 100 
    : 0;

  const plannedCost = consumptionPlan.plannedQuantity * consumptionPlan.plannedUnitCost;
  const actualCost = consumptionPlan.actualQuantity * consumptionPlan.actualUnitCost;
  const costVariance = actualCost - plannedCost;
  const costVariancePct = plannedCost > 0 ? (costVariance / plannedCost) * 100 : 0;

  const variance: VarianceAnalysis = {
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

export const getVarianceReport = async (projectId: string, period: string): Promise<any> => {
  const filter: any = { projectId };
  if (period) {
    filter.period = period;
  }

  const consumptionPlans = await ConsumptionPlan.find(filter)
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
