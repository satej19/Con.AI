import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .transform((val) => val.toUpperCase()),
  contactPerson: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email format').optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  materialsSupplied: z
    .array(z.string().regex(objectIdRegex, 'Invalid material ID format'))
    .optional(),
  rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').default(3),
});

export const updateSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  contactPerson: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email format').optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  materialsSupplied: z
    .array(z.string().regex(objectIdRegex, 'Invalid material ID format'))
    .optional(),
  rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  isActive: z.boolean().optional(),
});

export const supplierQuerySchema = z.object({
  materialId: z.string().regex(objectIdRegex, 'Invalid material ID format').optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid supplier ID format'),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>;
