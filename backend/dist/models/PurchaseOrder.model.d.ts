import { Document, Model, Types } from 'mongoose';
import { POStatus } from '../config/constants';
export interface IPOItem {
    materialId: Types.ObjectId;
    quantity: number;
    unitPrice: number;
    receivedQuantity: number;
    totalPrice: number;
}
export interface IPurchaseOrder extends Document {
    poNumber: string;
    projectId: Types.ObjectId;
    supplierId: Types.ObjectId;
    items: IPOItem[];
    status: POStatus;
    orderDate: Date;
    expectedDelivery: Date;
    actualDelivery?: Date | null;
    totalAmount: number;
    notes?: string;
    approvedBy?: Types.ObjectId | null;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const PurchaseOrderModel: Model<IPurchaseOrder>;
export default PurchaseOrderModel;
//# sourceMappingURL=PurchaseOrder.model.d.ts.map