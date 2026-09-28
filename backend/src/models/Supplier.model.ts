import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  materialsSupplied: Types.ObjectId[];
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      trim: true,
      uppercase: true,
      immutable: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    materialsSupplied: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    rating: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
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

supplierSchema.index({ code: 1 }, { unique: true });
supplierSchema.index({ materialsSupplied: 1 });

const SupplierModel: Model<ISupplier> =
  mongoose.models['Supplier'] || mongoose.model<ISupplier>('Supplier', supplierSchema);

export default SupplierModel;
