
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { createConsumptionPlanSchema, updateConsumptionPlanSchema, idParamSchema } from '../validators/consumption.validator';
import * as consumptionController from '../controllers/consumption.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create consumption plan (admin, manager)
router.post('/', requireManager, validateBody(createConsumptionPlanSchema), asyncHandler(consumptionController.create));

// List consumption plans (all authenticated users)
router.get('/', validateQuery(z.object({
  projectId: z.string().optional(),
  period: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})), asyncHandler(consumptionController.list));

// Get aggregated variance report (all authenticated users)
router.get('/report', validateQuery(z.object({
  projectId: z.string(),
  period: z.string().optional(),
})), asyncHandler(consumptionController.getReport));

// Get single consumption plan (all authenticated users)
router.get('/:id', validateParams(idParamSchema), asyncHandler(consumptionController.getById));

// Update consumption plan (admin, manager)
router.patch('/:id', requireManager, validateParams(idParamSchema), validateBody(updateConsumptionPlanSchema), asyncHandler(consumptionController.update));

// Get variance analysis for single plan (all authenticated users)
router.get('/:id/variance', validateParams(idParamSchema), asyncHandler(consumptionController.getVariance));

export default router;
