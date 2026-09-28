"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIdParamSchema = exports.projectQuerySchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
const projectStatusEnum = zod_1.z.enum([
    constants_1.PROJECT_STATUS.PLANNING,
    constants_1.PROJECT_STATUS.ACTIVE,
    constants_1.PROJECT_STATUS.ON_HOLD,
    constants_1.PROJECT_STATUS.COMPLETED,
]);
exports.createProjectSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, 'Project name is required'),
    code: zod_1.z
        .string()
        .trim()
        .min(1, 'Project code is required')
        .transform((val) => val.toUpperCase()),
    description: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().min(1, 'Site location is required'),
    status: projectStatusEnum.optional().default(constants_1.PROJECT_STATUS.PLANNING),
    startDate: zod_1.z.coerce.date({ message: 'Valid start date is required' }),
    expectedEndDate: zod_1.z.coerce.date({ message: 'Valid expected end date is required' }),
    budget: zod_1.z.coerce.number().min(0, 'Budget must be non-negative'),
    managerId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ID format'),
})
    .refine((data) => data.expectedEndDate >= data.startDate, {
    message: 'Expected end date must be on or after start date',
    path: ['expectedEndDate'],
});
exports.updateProjectSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, 'Project name cannot be empty').optional(),
    description: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().min(1, 'Site location cannot be empty').optional(),
    status: projectStatusEnum.optional(),
    startDate: zod_1.z.coerce.date().optional(),
    expectedEndDate: zod_1.z.coerce.date().optional(),
    actualEndDate: zod_1.z.coerce.date().nullable().optional(),
    budget: zod_1.z.coerce.number().min(0, 'Budget must be non-negative').optional(),
    managerId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ID format').optional(),
})
    .refine((data) => {
    if (data.startDate && data.expectedEndDate) {
        return data.expectedEndDate >= data.startDate;
    }
    return true;
}, {
    message: 'Expected end date must be on or after start date',
    path: ['expectedEndDate'],
});
exports.projectQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().optional(),
    status: projectStatusEnum.optional(),
});
exports.projectIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
});
//# sourceMappingURL=project.validator.js.map