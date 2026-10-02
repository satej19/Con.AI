"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateStatusSchema = exports.updateRoleSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Roles allowed for self-registration — admin is NOT included
const publicRoleEnum = zod_1.z.enum(['user', 'manager']);
// Full role enum used by admin to update roles
const roleEnum = zod_1.z.enum(['admin', 'manager', 'user']);
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    // role is accepted but only 'user' or 'manager' are allowed on self-registration.
    // The service enforces that the very first user always gets admin regardless.
    role: publicRoleEnum.optional().default('user'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateRoleSchema = zod_1.z.object({
    role: roleEnum,
});
exports.updateStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=auth.validator.js.map