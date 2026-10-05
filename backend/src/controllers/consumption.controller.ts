import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createConsumptionPlan,
  getAllConsumptionPlans,
  getConsumptionPlanById,
  updateConsumptionPlan,
  getVarianceAnalysis,
  getVarianceReport,
  syncActuals,
} from '../services/consumption.service';
import { CreateConsumptionPlanInput, UpdateConsumptionPlanInput } from '../validators/consumption.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const input: CreateConsumptionPlanInput = req.body;
  const consumptionPlan = await createConsumptionPlan(input, req.user.userId);
  ApiResponse.success(res, 201, 'Consumption plan created successfully', consumptionPlan);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const { consumptionPlans, meta } = await getAllConsumptionPlans(req.query);
  ApiResponse.success(res, 200, 'Consumption plans retrieved successfully', consumptionPlans, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const consumptionPlan = await getConsumptionPlanById(id);
  ApiResponse.success(res, 200, 'Consumption plan retrieved successfully', consumptionPlan);
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const input: UpdateConsumptionPlanInput = req.body;
  const consumptionPlan = await updateConsumptionPlan(id, input);
  ApiResponse.success(res, 200, 'Consumption plan updated successfully', consumptionPlan);
};

export const getVariance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const consumptionPlan = await getVarianceAnalysis(id);
  ApiResponse.success(res, 200, 'Variance analysis retrieved successfully', consumptionPlan);
};

export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId, period } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required');
  }
  const report = await getVarianceReport(projectId, period as string);
  ApiResponse.success(res, 200, 'Variance report retrieved successfully', report);
};

export const sync = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const result = await syncActuals(id);
  ApiResponse.success(res, 200, 'Actuals synced from inventory transactions', result);
};
