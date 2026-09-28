import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { validateQuery } from '../middleware/validate';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Cost analysis
router.get('/cost', validateQuery(z.object({
  projectId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})), asyncHandler(analyticsController.getCost));

// ABC classification
router.get('/abc', validateQuery(z.object({
  projectId: z.string(),
})), asyncHandler(analyticsController.getABC));

// SDE classification
router.get('/sde', validateQuery(z.object({
  projectId: z.string(),
})), asyncHandler(analyticsController.getSDE));

// EOQ analysis
router.get('/eoq', validateQuery(z.object({
  projectId: z.string(),
})), asyncHandler(analyticsController.getEOQ));

export default router;
