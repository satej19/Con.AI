import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  getCostAnalysis,
  getABCClassification,
  getSDEClassification,
  getEOQAnalysis,
} from '../services/analytics.service';

export const getCost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId, startDate, endDate } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required');
  }
  const analysis = await getCostAnalysis(projectId, startDate as string, endDate as string);
  ApiResponse.success(res, 200, 'Cost analysis retrieved successfully', analysis);
};

export const getABC = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required');
  }
  const classification = await getABCClassification(projectId);
  ApiResponse.success(res, 200, 'ABC classification retrieved successfully', classification);
};

export const getSDE = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required');
  }
  const classification = await getSDEClassification(projectId);
  ApiResponse.success(res, 200, 'SDE classification retrieved successfully', classification);
};

export const getEOQ = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required');
  }
  const analysis = await getEOQAnalysis(projectId);
  ApiResponse.success(res, 200, 'EOQ analysis retrieved successfully', analysis);
};
