import { z } from 'zod';

export const issueMaterialSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  notes: z.string().optional(),
});

export const returnMaterialSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  notes: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type IssueMaterialInput = z.infer<typeof issueMaterialSchema>;
export type ReturnMaterialInput = z.infer<typeof returnMaterialSchema>;
