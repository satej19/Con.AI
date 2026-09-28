import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  MATERIAL_CATEGORY,
  MATERIAL_UNIT,
  MaterialCategory,
  MaterialUnit,
} from '../config/constants';

interface IMaterial extends Document {
  name: string;
  code: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  description?: string;
  hsnCode?: string;
  reorderLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      immutable: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(MATERIAL_CATEGORY),
      required: [true, 'Category is required'],
      index: true,
    },
    unit: {
      type: String,
      enum: Object.values(MATERIAL_UNIT),
      required: [true, 'Unit is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    hsnCode: {
      type: String,
      trim: true,
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: [0, 'Reorder level cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

materialSchema.index({ code: 1 }, { unique: true });
materialSchema.index({ category: 1 });
materialSchema.index({ name: 'text' });

const MaterialModel: Model<IMaterial> = mongoose.models['Material'] || mongoose.model<IMaterial>('Material', materialSchema);

export default MaterialModel;
export type { IMaterial };
