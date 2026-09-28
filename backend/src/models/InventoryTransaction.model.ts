import mongoose, { Schema, Document, Model, Types } from 'mongoose';

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

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Inventory reference is required'],
    },
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
    type: {
      type: String,
      enum: ['RECEIVE', 'ISSUE', 'RETURN'],
      required: [true, 'Transaction type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be positive'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after is required'],
    },
    referenceType: {
      type: String,
      enum: ['purchase_order', 'manual', 'waste_return'],
      required: [true, 'Reference type is required'],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Reference ID is required'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

inventoryTransactionSchema.index({ inventoryId: 1, date: -1 });
inventoryTransactionSchema.index({ materialId: 1, date: -1 });
inventoryTransactionSchema.index({ projectId: 1, type: 1, date: -1 });
inventoryTransactionSchema.index({ type: 1, date: -1 });

const InventoryTransactionModel: Model<IInventoryTransaction> = mongoose.models['InventoryTransaction'] || mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransactionModel;
export type { IInventoryTransaction };
