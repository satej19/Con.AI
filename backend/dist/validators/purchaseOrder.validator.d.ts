import { z } from 'zod';
export declare const createPurchaseOrderSchema: z.ZodObject<{
    projectId: z.ZodString;
    supplierId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
        unitPrice: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
    expectedDelivery: z.ZodCoercedDate<unknown>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePurchaseOrderSchema: z.ZodObject<{
    supplierId: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
        unitPrice: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>>;
    expectedDelivery: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const receiveGoodsSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const poQuerySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    supplierId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        cancelled: "cancelled";
        draft: "draft";
        partially_received: "partially_received";
        received: "received";
    }>>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>;
export type POQueryInput = z.infer<typeof poQuerySchema>;
//# sourceMappingURL=purchaseOrder.validator.d.ts.map