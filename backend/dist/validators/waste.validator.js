"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.createWasteSchema = void 0;
const zod_1 = require("zod");
const wasteReasonEnum = zod_1.z.enum(['damaged', 'expired', 'spillage', 'defective', 'overuse', 'natural_loss', 'other']);
exports.createWasteSchema = zod_1.z.object({
    materialId: zod_1.z.string().min(1, 'Material ID is required'),
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    quantity: zod_1.z.coerce.number().min(1, 'Quantity must be positive'),
    reason: wasteReasonEnum,
    description: zod_1.z.string().optional(),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=waste.validator.js.map