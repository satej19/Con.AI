import { Document, Model, Types } from 'mongoose';
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
declare const SupplierModel: Model<ISupplier>;
export default SupplierModel;
//# sourceMappingURL=Supplier.model.d.ts.map