import { z } from 'zod';
export declare const createSupplierSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    contactPerson: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gstNumber: z.ZodOptional<z.ZodString>;
    materialsSupplied: z.ZodOptional<z.ZodArray<z.ZodString>>;
    rating: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateSupplierSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gstNumber: z.ZodOptional<z.ZodString>;
    materialsSupplied: z.ZodOptional<z.ZodArray<z.ZodString>>;
    rating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const supplierQuerySchema: z.ZodObject<{
    materialId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>;
//# sourceMappingURL=supplier.validator.d.ts.map