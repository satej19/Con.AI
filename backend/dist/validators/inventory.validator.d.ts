import { z } from 'zod';
export declare const issueMaterialSchema: z.ZodObject<{
    materialId: z.ZodString;
    projectId: z.ZodString;
    quantity: z.ZodCoercedNumber<unknown>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnMaterialSchema: z.ZodObject<{
    materialId: z.ZodString;
    projectId: z.ZodString;
    quantity: z.ZodCoercedNumber<unknown>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type IssueMaterialInput = z.infer<typeof issueMaterialSchema>;
export type ReturnMaterialInput = z.infer<typeof returnMaterialSchema>;
//# sourceMappingURL=inventory.validator.d.ts.map