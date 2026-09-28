import { Document, Model } from 'mongoose';
import { MaterialCategory, MaterialUnit } from '../config/constants';
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
declare const MaterialModel: Model<IMaterial>;
export default MaterialModel;
export type { IMaterial };
//# sourceMappingURL=Material.model.d.ts.map