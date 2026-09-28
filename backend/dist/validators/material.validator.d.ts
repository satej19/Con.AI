import { z } from 'zod';
export declare const createMaterialSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    category: z.ZodEnum<{
        aggregate: "aggregate";
        cement: "cement";
        chemical: "chemical";
        electrical: "electrical";
        other: "other";
        pipe: "pipe";
        steel: "steel";
        valve: "valve";
    }>;
    unit: z.ZodEnum<{
        bag: "bag";
        cubic_metre: "cubic_metre";
        kg: "kg";
        litre: "litre";
        metre: "metre";
        piece: "piece";
        sq_metre: "sq_metre";
        ton: "ton";
    }>;
    description: z.ZodOptional<z.ZodString>;
    hsnCode: z.ZodOptional<z.ZodString>;
    reorderLevel: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateMaterialSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    hsnCode: z.ZodOptional<z.ZodString>;
    reorderLevel: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const materialQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        aggregate: "aggregate";
        cement: "cement";
        chemical: "chemical";
        electrical: "electrical";
        other: "other";
        pipe: "pipe";
        steel: "steel";
        valve: "valve";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
//# sourceMappingURL=material.validator.d.ts.map