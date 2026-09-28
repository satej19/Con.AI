import { Document, Model, Types } from 'mongoose';
interface IInventoryTransaction extends Document {
    inventoryId: Types.ObjectId;
    materialId: Types.ObjectId;
    projectId: Types.ObjectId;
    type: string;
    quantity: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: Types.ObjectId;
    performedBy: Types.ObjectId;
    notes?: string;
    date: Date;
    createdAt: Date;
}
declare const InventoryTransactionModel: Model<IInventoryTransaction>;
export default InventoryTransactionModel;
export type { IInventoryTransaction };
//# sourceMappingURL=InventoryTransaction.model.d.ts.map