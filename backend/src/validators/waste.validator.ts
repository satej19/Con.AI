import { z } from 'zod';

const wasteReasonEnum = z.enum(['damaged', 'expired', 'spillage', 'defective', 'overuse', 'natural_loss', 'other']);

export const createWasteSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  reason: wasteReasonEnum,
  description: z.string().optional(),
  date: z.string().or(z.date()).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type CreateWasteInput = z.infer<typeof createWasteSchema>;
