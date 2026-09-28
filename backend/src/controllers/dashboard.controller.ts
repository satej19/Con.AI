import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  getDashboardSummary,
  getProjectDashboard as getProjectDashboardService,
} from '../services/dashboard.service';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.query;
  const summary = await getDashboardSummary(projectId as string);
  ApiResponse.success(res, 200, 'Dashboard summary retrieved successfully', summary);
};

export const getProjectDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.params;
  if (typeof projectId !== 'string') {
    throw new Error('Invalid project ID');
  }
  const dashboard = await getProjectDashboardService(projectId);
  ApiResponse.success(res, 200, 'Project dashboard retrieved successfully', dashboard);
};
