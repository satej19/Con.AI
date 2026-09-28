import { z } from 'zod';
export declare const createConsumptionPlanSchema: z.ZodObject<{
    projectId: z.ZodString;
    materialId: z.ZodString;
    plannedQuantity: z.ZodNumber;
    plannedUnitCost: z.ZodNumber;
    period: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateConsumptionPlanSchema: z.ZodObject<{
    actualQuantity: z.ZodOptional<z.ZodNumber>;
    actualUnitCost: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateConsumptionPlanInput = z.infer<typeof createConsumptionPlanSchema>;
export type UpdateConsumptionPlanInput = z.infer<typeof updateConsumptionPlanSchema>;
//# sourceMappingURL=consumption.validator.d.ts.map