import { z } from 'zod';
import { MATERIAL_CATEGORY, MATERIAL_UNIT } from '../config/constants';

const categoryEnum = z.enum(
  Object.values(MATERIAL_CATEGORY) as [string, ...string[]]
);
const unitEnum = z.enum(
  Object.values(MATERIAL_UNIT) as [string, ...string[]]
);

export const createMaterialSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .transform((val) => val.toUpperCase()),
  category: categoryEnum,
  unit: unitEnum,
  description: z.string().trim().optional(),
  hsnCode: z.string().trim().optional(),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative').default(0),
});

export const updateMaterialSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  category: categoryEnum.optional(),
  unit: unitEnum.optional(),
  description: z.string().trim().optional(),
  hsnCode: z.string().trim().optional(),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid material ID format'),
});

export const materialQuerySchema = z.object({
  category: categoryEnum.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type MaterialQueryInput = z.infer<typeof materialQuerySchema>;

