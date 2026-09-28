import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IWasteRecord extends Document {
  materialId: Types.ObjectId;
  projectId: Types.ObjectId;
  quantity: number;
  reason: string;
  description?: string;
  date: Date;
  reportedBy: Types.ObjectId;
  costImpact: number;
  createdAt: Date;
}

const wasteRecordSchema = new Schema<IWasteRecord>(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be positive'],
    },
    reason: {
      type: String,
      enum: ['damaged', 'expired', 'spillage', 'defective', 'overuse', 'natural_loss', 'other'],
      required: [true, 'Reason is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reported by is required'],
    },
    costImpact: {
      type: Number,
      required: [true, 'Cost impact is required'],
      min: [0, 'Cost impact cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

wasteRecordSchema.index({ projectId: 1, date: -1 });
wasteRecordSchema.index({ materialId: 1, date: -1 });
wasteRecordSchema.index({ reason: 1 });

const WasteRecordModel: Model<IWasteRecord> =
  mongoose.models['WasteRecord'] || mongoose.model<IWasteRecord>('WasteRecord', wasteRecordSchema);

export default WasteRecordModel;
export type { IWasteRecord };
