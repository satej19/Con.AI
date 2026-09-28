import { z } from 'zod';
export declare const createMaterialSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    category: z.ZodEnum<{
        [x: string]: string;
    }>;
    unit: z.ZodEnum<{
        [x: string]: string;
    }>;
    description: z.ZodOptional<z.ZodString>;
    hsnCode: z.ZodOptional<z.ZodString>;
    reorderLevel: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateMaterialSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    unit: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    description: z.ZodOptional<z.ZodString>;
    hsnCode: z.ZodOptional<z.ZodString>;
    reorderLevel: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const materialQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type MaterialQueryInput = z.infer<typeof materialQuerySchema>;
//# sourceMappingURL=material.validator.d.ts.map