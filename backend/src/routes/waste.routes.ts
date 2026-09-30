import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { createWasteSchema, idParamSchema } from '../validators/waste.validator';
import * as wasteController from '../controllers/waste.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create waste record (admin, manager)
router.post('/', requireManager, validateBody(createWasteSchema), asyncHandler(wasteController.create));

// List waste records (all authenticated users)
router.get('/', asyncHandler(wasteController.list));

// Get single waste record (all authenticated users)
router.get('/:id', validateParams(idParamSchema), asyncHandler(wasteController.getById));

export default router;
