import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IInventory extends Document {
  materialId: Types.ObjectId;
  projectId: Types.ObjectId;
  currentStock: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ materialId: 1, projectId: 1 }, { unique: true });
inventorySchema.index({ projectId: 1 });

const InventoryModel: Model<IInventory> =
  mongoose.models['Inventory'] || mongoose.model<IInventory>('Inventory', inventorySchema);

export default InventoryModel;
export type { IInventory };
