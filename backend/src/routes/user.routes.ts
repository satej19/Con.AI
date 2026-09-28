import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { updateRoleSchema, updateStatusSchema, idParamSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Admin only routes
router.get('/', authenticate, requireAdmin, asyncHandler(authController.listUsers));
router.patch('/:id/role', authenticate, requireAdmin, validateParams(idParamSchema), validateBody(updateRoleSchema), asyncHandler(authController.updateRole));
router.patch('/:id/status', authenticate, requireAdmin, validateParams(idParamSchema), validateBody(updateStatusSchema), asyncHandler(authController.updateStatus));

export default router;
