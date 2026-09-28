import { z } from 'zod';

const roleEnum = z.enum(['admin', 'manager', 'engineer', 'store_keeper', 'viewer']);

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateRoleSchema = z.object({
  role: roleEnum,
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
