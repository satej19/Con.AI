"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.poQuerySchema = exports.receiveGoodsSchema = exports.updatePurchaseOrderSchema = exports.createPurchaseOrderSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const poStatusEnum = zod_1.z.enum([
    constants_1.PO_STATUS.DRAFT,
    constants_1.PO_STATUS.APPROVED,
    constants_1.PO_STATUS.PARTIALLY_RECEIVED,
    constants_1.PO_STATUS.RECEIVED,
    constants_1.PO_STATUS.CANCELLED,
]);
const poItemSchema = zod_1.z.object({
    materialId: zod_1.z.string().regex(objectIdRegex, 'Invalid material ID format'),
    quantity: zod_1.z.coerce.number().min(0.001, 'Quantity must be positive'),
    unitPrice: zod_1.z.coerce.number().min(0, 'Unit price cannot be negative'),
});
exports.createPurchaseOrderSchema = zod_1.z.object({
    projectId: zod_1.z.string().regex(objectIdRegex, 'Invalid project ID format'),
    supplierId: zod_1.z.string().regex(objectIdRegex, 'Invalid supplier ID format'),
    items: zod_1.z.array(poItemSchema).min(1, 'At least one item is required'),
    expectedDelivery: zod_1.z.coerce.date({ message: 'Valid expected delivery date is required' }),
    notes: zod_1.z.string().trim().optional(),
});
exports.updatePurchaseOrderSchema = zod_1.z.object({
    supplierId: zod_1.z.string().regex(objectIdRegex, 'Invalid supplier ID format').optional(),
    items: zod_1.z.array(poItemSchema).min(1, 'Items array cannot be empty').optional(),
    expectedDelivery: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().trim().optional(),
});
exports.receiveGoodsSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        materialId: zod_1.z.string().regex(objectIdRegex, 'Invalid material ID format'),
        quantity: zod_1.z.coerce.number().min(0.001, 'Received quantity must be positive'),
    }))
        .min(1, 'At least one item must be received'),
});
exports.poQuerySchema = zod_1.z.object({
    projectId: zod_1.z.string().regex(objectIdRegex, 'Invalid project ID format').optional(),
    supplierId: zod_1.z.string().regex(objectIdRegex, 'Invalid supplier ID format').optional(),
    status: poStatusEnum.optional(),
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(objectIdRegex, 'Invalid purchase order ID format'),
});
//# sourceMappingURL=purchaseOrder.validator.js.map