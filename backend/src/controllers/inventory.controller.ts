import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  getAllInventory,
  getInventoryById,
  issueMaterial,
  returnMaterial as returnMaterialService,
  getTransactions,
} from '../services/inventory.service';
import { IssueMaterialInput, ReturnMaterialInput } from '../validators/inventory.validator';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const { inventory, meta } = await getAllInventory(req.query);
  ApiResponse.success(res, 200, 'Inventory retrieved successfully', inventory, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const inventory = await getInventoryById(id);
  ApiResponse.success(res, 200, 'Inventory retrieved successfully', inventory);
};

export const issue = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const input: IssueMaterialInput = req.body;
  const inventory = await issueMaterial(input, req.user.userId);
  ApiResponse.success(res, 200, 'Material issued successfully', inventory);
};

export const returnMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const input: ReturnMaterialInput = req.body;
  const inventory = await returnMaterialService(input, req.user.userId);
  ApiResponse.success(res, 200, 'Material returned successfully', inventory);
};

export const listTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { transactions, meta } = await getTransactions(req.query);
  ApiResponse.success(res, 200, 'Transactions retrieved successfully', transactions, meta);
};
