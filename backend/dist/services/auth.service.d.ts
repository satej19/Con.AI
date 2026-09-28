import type { IUser } from '../models/User.model';
import { RegisterInput, LoginInput, UpdateRoleInput, UpdateStatusInput } from '../validators/auth.validator';
export declare const registerUser: (input: RegisterInput) => Promise<{
    user: Partial<IUser>;
    token: string;
}>;
export declare const loginUser: (input: LoginInput) => Promise<{
    user: Partial<IUser>;
    token: string;
}>;
export declare const getCurrentUser: (userId: string) => Promise<Partial<IUser>>;
export declare const getAllUsers: () => Promise<Partial<IUser>[]>;
export declare const updateUserRole: (userId: string, input: UpdateRoleInput) => Promise<Partial<IUser>>;
export declare const updateUserStatus: (userId: string, input: UpdateStatusInput) => Promise<Partial<IUser>>;
//# sourceMappingURL=auth.service.d.ts.map