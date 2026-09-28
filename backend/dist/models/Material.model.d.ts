import { Document, Model } from 'mongoose';
interface IMaterial extends Document {
    name: string;
    code: string;
    category: string;
    unit: string;
    description?: string;
    hsnCode?: string;
    reorderLevel: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const MaterialModel: Model<IMaterial>;
export default MaterialModel;
export type { IMaterial };
//# sourceMappingURL=Material.model.d.ts.map