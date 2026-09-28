import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        on_hold: "on_hold";
        planning: "planning";
    }>>>;
    startDate: z.ZodCoercedDate<unknown>;
    expectedEndDate: z.ZodCoercedDate<unknown>;
    budget: z.ZodCoercedNumber<unknown>;
    managerId: z.ZodString;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        on_hold: "on_hold";
        planning: "planning";
    }>>;
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    expectedEndDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    actualEndDate: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
    budget: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    managerId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const projectQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        on_hold: "on_hold";
        planning: "planning";
    }>>;
}, z.core.$strip>;
export declare const projectIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
//# sourceMappingURL=project.validator.d.ts.map