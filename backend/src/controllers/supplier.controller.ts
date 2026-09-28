import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
} from '../services/supplier.service';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQueryInput,
} from '../validators/supplier.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const input: CreateSupplierInput = req.body;
  const supplier = await createSupplier(input);
  ApiResponse.success(res, 201, 'Supplier created successfully', supplier);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = req.query as unknown as SupplierQueryInput;
  const { suppliers, meta } = await getAllSuppliers(query);
  ApiResponse.success(res, 200, 'Suppliers retrieved successfully', suppliers, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const supplier = await getSupplierById(id as string);
  ApiResponse.success(res, 200, 'Supplier retrieved successfully', supplier);
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const input: UpdateSupplierInput = req.body;
  const supplier = await updateSupplier(id as string, input);
  ApiResponse.success(res, 200, 'Supplier updated successfully', supplier);
};
