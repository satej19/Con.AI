"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.supplierQuerySchema = exports.updateSupplierSchema = exports.createSupplierSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createSupplierSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z
        .string()
        .trim()
        .min(1, 'Code is required')
        .transform((val) => val.toUpperCase()),
    contactPerson: zod_1.z.string().trim().optional(),
    email: zod_1.z.string().trim().email('Invalid email format').optional(),
    phone: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    gstNumber: zod_1.z.string().trim().optional(),
    materialsSupplied: zod_1.z
        .array(zod_1.z.string().regex(objectIdRegex, 'Invalid material ID format'))
        .optional(),
    rating: zod_1.z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').default(3),
});
exports.updateSupplierSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    contactPerson: zod_1.z.string().trim().optional(),
    email: zod_1.z.string().trim().email('Invalid email format').optional(),
    phone: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    gstNumber: zod_1.z.string().trim().optional(),
    materialsSupplied: zod_1.z
        .array(zod_1.z.string().regex(objectIdRegex, 'Invalid material ID format'))
        .optional(),
    rating: zod_1.z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.supplierQuerySchema = zod_1.z.object({
    materialId: zod_1.z.string().regex(objectIdRegex, 'Invalid material ID format').optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().trim().optional(),
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(objectIdRegex, 'Invalid supplier ID format'),
});
//# sourceMappingURL=supplier.validator.js.map