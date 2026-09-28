import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IConsumptionPlan extends Document {
  projectId: Types.ObjectId;
  materialId: Types.ObjectId;
  plannedQuantity: number;
  actualQuantity: number;
  plannedUnitCost: number;
  actualUnitCost: number;
  period: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const consumptionPlanSchema = new Schema<IConsumptionPlan>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
    },
    plannedQuantity: {
      type: Number,
      required: [true, 'Planned quantity is required'],
      min: [0, 'Planned quantity cannot be negative'],
    },
    actualQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Actual quantity cannot be negative'],
    },
    plannedUnitCost: {
      type: Number,
      required: [true, 'Planned unit cost is required'],
      min: [0, 'Planned unit cost cannot be negative'],
    },
    actualUnitCost: {
      type: Number,
      default: 0,
      min: [0, 'Actual unit cost cannot be negative'],
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

consumptionPlanSchema.index({ projectId: 1, materialId: 1, period: 1 }, { unique: true });
consumptionPlanSchema.index({ projectId: 1, period: 1 });

const ConsumptionPlanModel: Model<IConsumptionPlan> =
  mongoose.models['ConsumptionPlan'] ||
  mongoose.model<IConsumptionPlan>('ConsumptionPlan', consumptionPlanSchema);

export default ConsumptionPlanModel;
export type { IConsumptionPlan };
