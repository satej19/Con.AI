import { Document, Model, Types } from 'mongoose';
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
declare const WasteRecordModel: Model<IWasteRecord>;
export default WasteRecordModel;
export type { IWasteRecord };
//# sourceMappingURL=WasteRecord.model.d.ts.map