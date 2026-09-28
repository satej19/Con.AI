import { Document, Model, Types } from 'mongoose';
interface IInventoryTransaction extends Document {
    inventoryId: Types.ObjectId | string;
    materialId: Types.ObjectId | string;
    projectId: Types.ObjectId | string;
    type: string;
    quantity: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: Types.ObjectId | string;
    performedBy: Types.ObjectId | string;
    notes?: string;
    date: Date;
    createdAt: Date;
}
declare const InventoryTransactionModel: Model<IInventoryTransaction>;
export default InventoryTransactionModel;
export type { IInventoryTransaction };
//# sourceMappingURL=InventoryTransaction.model.d.ts.map