import { z } from 'zod';

export const createConsumptionPlanSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  materialId: z.string().min(1, 'Material ID is required'),
  plannedQuantity: z.number().min(0, 'Planned quantity cannot be negative'),
  plannedUnitCost: z.number().min(0, 'Planned unit cost cannot be negative'),
  period: z.string().min(1, 'Period is required'),
  notes: z.string().optional(),
});

export const updateConsumptionPlanSchema = z.object({
  actualQuantity: z.number().min(0, 'Actual quantity cannot be negative').optional(),
  actualUnitCost: z.number().min(0, 'Actual unit cost cannot be negative').optional(),
  notes: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type CreateConsumptionPlanInput = z.infer<typeof createConsumptionPlanSchema>;
export type UpdateConsumptionPlanInput = z.infer<typeof updateConsumptionPlanSchema>;
