import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
} from '../validators/project.validator';
import * as projectController from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post(
  '/',
  requireManager,
  validateBody(createProjectSchema),
  asyncHandler(projectController.create)
);

router.get(
  '/',
  validateQuery(projectQuerySchema),
  asyncHandler(projectController.list)
);

router.get(
  '/:id',
  validateParams(projectIdParamSchema),
  asyncHandler(projectController.getById)
);

router.patch(
  '/:id',
  requireManager,
  validateParams(projectIdParamSchema),
  validateBody(updateProjectSchema),
  asyncHandler(projectController.update)
);

export default router;
