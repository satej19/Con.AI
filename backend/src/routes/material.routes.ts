import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireStoreKeeper } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { createMaterialSchema, updateMaterialSchema, idParamSchema, materialQuerySchema } from '../validators/material.validator';
import * as materialController from '../controllers/material.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create material (admin, manager, store_keeper)
router.post('/', requireStoreKeeper, validateBody(createMaterialSchema), asyncHandler(materialController.create));

// List materials (all authenticated users)
router.get('/', validateQuery(materialQuerySchema), asyncHandler(materialController.list));

// Get single material (all authenticated users)
router.get('/:id', validateParams(idParamSchema), asyncHandler(materialController.getById));

// Update material (admin, manager, store_keeper)
router.patch('/:id', requireStoreKeeper, validateParams(idParamSchema), validateBody(updateMaterialSchema), asyncHandler(materialController.update));

export default router;
