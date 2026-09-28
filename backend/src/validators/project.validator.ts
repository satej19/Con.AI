import { z } from 'zod';
import { PROJECT_STATUS } from '../config/constants';

const projectStatusEnum = z.enum([
  PROJECT_STATUS.PLANNING,
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.ON_HOLD,
  PROJECT_STATUS.COMPLETED,
]);

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required'),
    code: z
      .string()
      .trim()
      .min(1, 'Project code is required')
      .transform((val) => val.toUpperCase()),
    description: z.string().trim().optional(),
    location: z.string().trim().min(1, 'Site location is required'),
    status: projectStatusEnum.optional().default(PROJECT_STATUS.PLANNING),
    startDate: z.coerce.date({ message: 'Valid start date is required' }),
    expectedEndDate: z.coerce.date({ message: 'Valid expected end date is required' }),
    budget: z.coerce.number().min(0, 'Budget must be non-negative'),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ID format'),
  })
  .refine((data) => data.expectedEndDate >= data.startDate, {
    message: 'Expected end date must be on or after start date',
    path: ['expectedEndDate'],
  });

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name cannot be empty').optional(),
    description: z.string().trim().optional(),
    location: z.string().trim().min(1, 'Site location cannot be empty').optional(),
    status: projectStatusEnum.optional(),
    startDate: z.coerce.date().optional(),
    expectedEndDate: z.coerce.date().optional(),
    actualEndDate: z.coerce.date().nullable().optional(),
    budget: z.coerce.number().min(0, 'Budget must be non-negative').optional(),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ID format').optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.expectedEndDate) {
        return data.expectedEndDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'Expected end date must be on or after start date',
      path: ['expectedEndDate'],
    }
  );

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: projectStatusEnum.optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
