import { Document, Model, Types } from 'mongoose';
interface IConsumptionPlan extends Document {
    projectId: Types.ObjectId | string;
    materialId: Types.ObjectId | string;
    plannedQuantity: number;
    actualQuantity: number;
    plannedUnitCost: number;
    actualUnitCost: number;
    period: string;
    notes?: string;
    createdBy: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
declare const ConsumptionPlanModel: Model<IConsumptionPlan>;
export default ConsumptionPlanModel;
export type { IConsumptionPlan };
//# sourceMappingURL=ConsumptionPlan.model.d.ts.map