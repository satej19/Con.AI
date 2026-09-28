import { Document, Model, Types } from 'mongoose';
interface IWasteRecord extends Document {
    materialId: Types.ObjectId | string;
    projectId: Types.ObjectId | string;
    quantity: number;
    reason: string;
    description?: string;
    date: Date;
    reportedBy: Types.ObjectId | string;
    costImpact: number;
    createdAt: Date;
}
declare const WasteRecordModel: Model<IWasteRecord>;
export default WasteRecordModel;
export type { IWasteRecord };
//# sourceMappingURL=WasteRecord.model.d.ts.map