import { Document, Model, Types } from 'mongoose';
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
declare const ConsumptionPlanModel: Model<IConsumptionPlan>;
export default ConsumptionPlanModel;
export type { IConsumptionPlan };
//# sourceMappingURL=ConsumptionPlan.model.d.ts.map