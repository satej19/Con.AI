import { IPurchaseOrder } from '../models/PurchaseOrder.model';
import type { CreatePurchaseOrderInput, UpdatePurchaseOrderInput, ReceiveGoodsInput, POQueryInput } from '../validators/purchaseOrder.validator';
import { PaginationMeta } from '../utils/pagination';
export declare const createPurchaseOrder: (input: CreatePurchaseOrderInput, userId: string) => Promise<IPurchaseOrder>;
export declare const getAllPurchaseOrders: (query: POQueryInput) => Promise<{
    purchaseOrders: IPurchaseOrder[];
    meta: PaginationMeta;
}>;
export declare const getPurchaseOrderById: (id: string) => Promise<IPurchaseOrder>;
export declare const updatePurchaseOrder: (id: string, input: UpdatePurchaseOrderInput) => Promise<IPurchaseOrder>;
export declare const approvePurchaseOrder: (id: string, userId: string) => Promise<IPurchaseOrder>;
export declare const receiveGoods: (id: string, input: ReceiveGoodsInput, userId: string) => Promise<IPurchaseOrder>;
export declare const cancelPurchaseOrder: (id: string) => Promise<IPurchaseOrder>;
//# sourceMappingURL=purchaseOrder.service.d.ts.map