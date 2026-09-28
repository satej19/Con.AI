import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PO_STATUS, POStatus } from '../config/constants';

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

const poItemSchema = new Schema<IPOItem>(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be positive'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: {
      type: String,
      required: [true, 'PO number is required'],
      trim: true,
      uppercase: true,
      immutable: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    items: {
      type: [poItemSchema],
      required: true,
      validate: [(val: IPOItem[]) => val.length > 0, 'PO must have at least one item'],
    },
    status: {
      type: String,
      enum: Object.values(PO_STATUS),
      default: PO_STATUS.DRAFT,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDelivery: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
    },
    actualDelivery: {
      type: Date,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ projectId: 1 });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });

const PurchaseOrderModel: Model<IPurchaseOrder> =
  mongoose.models['PurchaseOrder'] ||
  mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrderModel;
