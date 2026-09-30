"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateStatusSchema = exports.updateRoleSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const roleEnum = zod_1.z.enum(['admin', 'manager', 'user']);
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: roleEnum.optional(),
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