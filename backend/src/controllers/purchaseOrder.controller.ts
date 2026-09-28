import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receiveGoods,
  cancelPurchaseOrder,
} from '../services/purchaseOrder.service';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceiveGoodsInput,
  POQueryInput,
} from '../validators/purchaseOrder.validator';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const input: CreatePurchaseOrderInput = req.body;
  const purchaseOrder = await createPurchaseOrder(input, req.user.userId);
  ApiResponse.success(res, 201, 'Purchase order created successfully', purchaseOrder);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = req.query as unknown as POQueryInput;
  const { purchaseOrders, meta } = await getAllPurchaseOrders(query);
  ApiResponse.success(res, 200, 'Purchase orders retrieved successfully', purchaseOrders, meta);
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const purchaseOrder = await getPurchaseOrderById(id as string);
  ApiResponse.success(res, 200, 'Purchase order retrieved successfully', purchaseOrder);
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const input: UpdatePurchaseOrderInput = req.body;
  const purchaseOrder = await updatePurchaseOrder(id as string, input);
  ApiResponse.success(res, 200, 'Purchase order updated successfully', purchaseOrder);
};

export const approve = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const { id } = req.params;
  const purchaseOrder = await approvePurchaseOrder(id as string, req.user.userId);
  ApiResponse.success(res, 200, 'Purchase order approved successfully', purchaseOrder);
};

export const receive = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const { id } = req.params;
  const input: ReceiveGoodsInput = req.body;
  const purchaseOrder = await receiveGoods(id as string, input, req.user.userId);
  ApiResponse.success(res, 200, 'Goods received and inventory updated successfully', purchaseOrder);
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const purchaseOrder = await cancelPurchaseOrder(id as string);
  ApiResponse.success(res, 200, 'Purchase order cancelled successfully', purchaseOrder);
};
