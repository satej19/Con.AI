import { Document, Model, Types } from 'mongoose';
import { ProjectStatus } from '../config/constants';
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
declare const ProjectModel: Model<IProject>;
export default ProjectModel;
//# sourceMappingURL=Project.model.d.ts.map