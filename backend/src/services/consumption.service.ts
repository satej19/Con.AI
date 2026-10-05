import ConsumptionPlan, { IConsumptionPlan } from '../models/ConsumptionPlan.model';
import Material from '../models/Material.model';
import Project from '../models/Project.model';
import InventoryTransaction from '../models/InventoryTransaction.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
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

export const syncActuals = async (id: string): Promise<any> => {
  const consumptionPlan = await ConsumptionPlan.findById(id);
  if (!consumptionPlan) {
    throw new AppError('Consumption plan not found', 404);
  }

  // Derive the date range from the period string.
  // Supported formats: "YYYY-MM" (monthly) and "YYYY-QN" (quarterly, e.g. 2026-Q4)
  let periodStart: Date;
  let periodEnd: Date;

  const monthMatch = consumptionPlan.period.match(/^(\d{4})-(\d{2})$/);
  const quarterMatch = consumptionPlan.period.match(/^(\d{4})-Q([1-4])$/i);

  if (monthMatch) {
    const year = parseInt(monthMatch[1]!, 10);
    const month = parseInt(monthMatch[2]!, 10) - 1; // 0-indexed
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month + 1, 1); // exclusive upper bound
  } else if (quarterMatch) {
    const year = parseInt(quarterMatch[1]!, 10);
    const quarter = parseInt(quarterMatch[2]!, 10);
    const startMonth = (quarter - 1) * 3; // Q1→0, Q2→3, Q3→6, Q4→9
    periodStart = new Date(year, startMonth, 1);
    periodEnd = new Date(year, startMonth + 3, 1);
  } else {
    throw new AppError(
      `Unrecognised period format "${consumptionPlan.period}". Use YYYY-MM or YYYY-QN.`,
      400
    );
  }

  // actualQuantity — sum of all ISSUE transactions for this material+project in the period
  const issueAgg = await InventoryTransaction.aggregate([
    {
      $match: {
        materialId: consumptionPlan.materialId,
        projectId: consumptionPlan.projectId,
        type: 'ISSUE',
        date: { $gte: periodStart, $lt: periodEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalIssued: { $sum: '$quantity' },
      },
    },
  ]);

  const actualQuantity: number = issueAgg[0]?.totalIssued ?? 0;

  // actualUnitCost — weighted average unit price from received PO items for this material+project
  // We look across all time (not just the period) so we always have a price reference.
  const poAgg = await PurchaseOrder.aggregate([
    {
      $match: {
        projectId: consumptionPlan.projectId,
        status: { $in: ['received', 'partially_received'] },
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.materialId': consumptionPlan.materialId,
        'items.receivedQuantity': { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: { $multiply: ['$items.receivedQuantity', '$items.unitPrice'] },
        },
        totalReceived: { $sum: '$items.receivedQuantity' },
      },
    },
  ]);

  const actualUnitCost: number =
    poAgg[0] && poAgg[0].totalReceived > 0
      ? poAgg[0].totalValue / poAgg[0].totalReceived
      : consumptionPlan.actualUnitCost; // keep existing value if no PO data yet

  // Persist the synced values
  consumptionPlan.actualQuantity = actualQuantity;
  consumptionPlan.actualUnitCost = Math.round(actualUnitCost * 100) / 100; // round to 2dp
  await consumptionPlan.save();

  // Return with full variance breakdown
  const plannedCost = consumptionPlan.plannedQuantity * consumptionPlan.plannedUnitCost;
  const actualCost = actualQuantity * consumptionPlan.actualUnitCost;

  return {
    ...(consumptionPlan.toObject()),
    syncedFrom: { periodStart, periodEnd },
    variance: {
      quantityVariance: actualQuantity - consumptionPlan.plannedQuantity,
      quantityVariancePct:
        consumptionPlan.plannedQuantity > 0
          ? ((actualQuantity - consumptionPlan.plannedQuantity) / consumptionPlan.plannedQuantity) * 100
          : 0,
      plannedCost,
      actualCost,
      costVariance: actualCost - plannedCost,
      costVariancePct: plannedCost > 0 ? ((actualCost - plannedCost) / plannedCost) * 100 : 0,
    },
  };
};
