import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PROJECT_STATUS, ProjectStatus } from '../config/constants';

export interface IProject extends Document {
  name: string;
  code: string;
  description?: string;
  location: string;
  status: ProjectStatus;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date | null;
  budget: number;
  managerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Project code is required'],
      trim: true,
      uppercase: true,
      immutable: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Site location is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required'],
    },
    actualEndDate: {
      type: Date,
      default: null,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be non-negative'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project manager is required'],
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ status: 1 });
projectSchema.index({ managerId: 1 });

const ProjectModel: Model<IProject> =
  mongoose.models['Project'] || mongoose.model<IProject>('Project', projectSchema);

export default ProjectModel;
