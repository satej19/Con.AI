import { z } from 'zod';
import { PO_STATUS } from '../config/constants';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const poStatusEnum = z.enum([
  PO_STATUS.DRAFT,
  PO_STATUS.APPROVED,
  PO_STATUS.PARTIALLY_RECEIVED,
  PO_STATUS.RECEIVED,
  PO_STATUS.CANCELLED,
]);

const poItemSchema = z.object({
  materialId: z.string().regex(objectIdRegex, 'Invalid material ID format'),
  quantity: z.coerce.number().min(0.001, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
});

export const createPurchaseOrderSchema = z.object({
  projectId: z.string().regex(objectIdRegex, 'Invalid project ID format'),
  supplierId: z.string().regex(objectIdRegex, 'Invalid supplier ID format'),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
  expectedDelivery: z.coerce.date({ message: 'Valid expected delivery date is required' }),
  notes: z.string().trim().optional(),
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().regex(objectIdRegex, 'Invalid supplier ID format').optional(),
  items: z.array(poItemSchema).min(1, 'Items array cannot be empty').optional(),
  expectedDelivery: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export const receiveGoodsSchema = z.object({
  items: z
    .array(
      z.object({
        materialId: z.string().regex(objectIdRegex, 'Invalid material ID format'),
        quantity: z.coerce.number().min(0.001, 'Received quantity must be positive'),
      })
    )
    .min(1, 'At least one item must be received'),
});

export const poQuerySchema = z.object({
  projectId: z.string().regex(objectIdRegex, 'Invalid project ID format').optional(),
  supplierId: z.string().regex(objectIdRegex, 'Invalid supplier ID format').optional(),
  status: poStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid purchase order ID format'),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>;
export type POQueryInput = z.infer<typeof poQuerySchema>;
