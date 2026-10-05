import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createWasteRecord,
  getAllWasteRecords,
  getWasteRecordById,
  recalculateWasteCosts,
} from '../services/waste.service';
import { CreateWasteInput } from '../validators/waste.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const input: CreateWasteInput = req.body;
  const wasteRecord = await createWasteRecord(input, req.user.userId);
  ApiResponse.success(res, 201, 'Waste record created successfully', wasteRecord);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const { wasteRecords, meta } = await getAllWasteRecords(req.query);
  ApiResponse.success(res, 200, 'Waste records retrieved successfully', wasteRecords, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const wasteRecord = await getWasteRecordById(id);
  ApiResponse.success(res, 200, 'Waste record retrieved successfully', wasteRecord);
};

export const recalculate = async (_req: AuthRequest, res: Response): Promise<void> => {
  const result = await recalculateWasteCosts();
  ApiResponse.success(res, 200, `Recalculated cost impact for ${result.updated} waste record(s)`, result);
};
