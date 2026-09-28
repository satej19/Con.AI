import { Document, Model } from 'mongoose';
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type { IUser };
declare const UserModel: Model<IUser>;
export default UserModel;
//# sourceMappingURL=User.model.d.ts.map