"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialQuerySchema = exports.idParamSchema = exports.updateMaterialSchema = exports.createMaterialSchema = void 0;
const zod_1 = require("zod");
const categoryEnum = zod_1.z.enum(['cement', 'steel', 'aggregate', 'chemical', 'pipe', 'valve', 'electrical', 'other']);
const unitEnum = zod_1.z.enum(['kg', 'ton', 'litre', 'metre', 'piece', 'bag', 'cubic_metre', 'sq_metre']);
exports.createMaterialSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z.string().min(1, 'Code is required'),
    category: categoryEnum,
    unit: unitEnum,
    description: zod_1.z.string().optional(),
    hsnCode: zod_1.z.string().optional(),
    reorderLevel: zod_1.z.number().min(0, 'Reorder level cannot be negative').default(0),
});
exports.updateMaterialSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: zod_1.z.string().optional(),
    hsnCode: zod_1.z.string().optional(),
    reorderLevel: zod_1.z.number().min(0, 'Reorder level cannot be negative').optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
exports.materialQuerySchema = zod_1.z.object({
    category: categoryEnum.optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
});
//# sourceMappingURL=material.validator.js.map