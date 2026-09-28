import { Document, Model, Types } from 'mongoose';
import { TransactionType, ReferenceType } from '../config/constants';
export interface IInventoryTransaction extends Document {
    inventoryId: Types.ObjectId;
    materialId: Types.ObjectId;
    projectId: Types.ObjectId;
    type: TransactionType;
    quantity: number;
    previousStock: number;
    newStock: number;
    referenceType: ReferenceType;
    referenceId?: Types.ObjectId | string;
    unitPrice: number;
    totalCost: number;
    performedBy: Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const InventoryTransactionModel: Model<IInventoryTransaction>;
export default InventoryTransactionModel;
//# sourceMappingURL=InventoryTransaction.model.d.ts.map