"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.returnMaterialSchema = exports.issueMaterialSchema = void 0;
const zod_1 = require("zod");
exports.issueMaterialSchema = zod_1.z.object({
    materialId: zod_1.z.string().min(1, 'Material ID is required'),
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    quantity: zod_1.z.coerce.number().min(1, 'Quantity must be positive'),
    notes: zod_1.z.string().optional(),
});
exports.returnMaterialSchema = zod_1.z.object({
    materialId: zod_1.z.string().min(1, 'Material ID is required'),
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    quantity: zod_1.z.coerce.number().min(1, 'Quantity must be positive'),
    notes: zod_1.z.string().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=inventory.validator.js.map