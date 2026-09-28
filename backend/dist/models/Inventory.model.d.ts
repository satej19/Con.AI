import { Document, Model, Types } from 'mongoose';
export interface IInventory extends Document {
    materialId: Types.ObjectId;
    projectId: Types.ObjectId;
    currentStock: number;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const InventoryModel: Model<IInventory>;
export default InventoryModel;
//# sourceMappingURL=Inventory.model.d.ts.map