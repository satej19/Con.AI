import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import {
  TRANSACTION_TYPE,
  TransactionType,
  REFERENCE_TYPE,
  ReferenceType,
} from '../config/constants';

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

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Inventory reference is required'],
      index: true,
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
      enum: Object.values(TRANSACTION_TYPE),
      required: [true, 'Transaction type is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be positive'],
    },
    previousStock: {
      type: Number,
      required: [true, 'Previous stock is required'],
    },
    newStock: {
      type: Number,
      required: [true, 'New stock is required'],
    },
    referenceType: {
      type: String,
      enum: Object.values(REFERENCE_TYPE),
      required: [true, 'Reference type is required'],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, 'Unit price cannot be negative'],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, 'Total cost cannot be negative'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by user is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

inventoryTransactionSchema.index({ inventoryId: 1 });
inventoryTransactionSchema.index({ projectId: 1, materialId: 1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransactionModel: Model<IInventoryTransaction> =
  mongoose.models['InventoryTransaction'] ||
  mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransactionModel;
