"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialQuerySchema = exports.idParamSchema = exports.updateMaterialSchema = exports.createMaterialSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
const categoryEnum = zod_1.z.enum(Object.values(constants_1.MATERIAL_CATEGORY));
const unitEnum = zod_1.z.enum(Object.values(constants_1.MATERIAL_UNIT));
exports.createMaterialSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z
        .string()
        .trim()
        .min(1, 'Code is required')
        .transform((val) => val.toUpperCase()),
    category: categoryEnum,
    unit: unitEnum,
    description: zod_1.z.string().trim().optional(),
    hsnCode: zod_1.z.string().trim().optional(),
    reorderLevel: zod_1.z.coerce.number().min(0, 'Reorder level cannot be negative').default(0),
});
exports.updateMaterialSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    category: categoryEnum.optional(),
    unit: unitEnum.optional(),
    description: zod_1.z.string().trim().optional(),
    hsnCode: zod_1.z.string().trim().optional(),
    reorderLevel: zod_1.z.coerce.number().min(0, 'Reorder level cannot be negative').optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid material ID format'),
});
exports.materialQuerySchema = zod_1.z.object({
    category: categoryEnum.optional(),
    search: zod_1.z.string().trim().optional(),
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=material.validator.js.map