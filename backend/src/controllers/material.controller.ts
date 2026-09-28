import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
} from '../services/material.service';
import {
  CreateMaterialInput,
  UpdateMaterialInput,
  MaterialQueryInput,
} from '../validators/material.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const input: CreateMaterialInput = req.body;
  const material = await createMaterial(input);
  ApiResponse.success(res, 201, 'Material created successfully', material);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = req.query as unknown as MaterialQueryInput;
  const { materials, meta } = await getAllMaterials(query);
  ApiResponse.success(res, 200, 'Materials retrieved successfully', materials, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const material = await getMaterialById(id);
  ApiResponse.success(res, 200, 'Material retrieved successfully', material);
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new Error('Invalid ID');
  }
  const input: UpdateMaterialInput = req.body;
  const material = await updateMaterial(id, input);
  ApiResponse.success(res, 200, 'Material updated successfully', material);
};
