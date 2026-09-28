import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { validateParams, validateQuery } from '../middleware/validate';
import * as dashboardController from '../controllers/dashboard.controller';

const idParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get overall dashboard summary
router.get('/summary', validateQuery(z.object({
  projectId: z.string().optional(),
})), asyncHandler(dashboardController.getSummary));

// Get project-specific dashboard
router.get('/project/:projectId', validateParams(idParamSchema), asyncHandler(dashboardController.getProjectDashboard));

export default router;
