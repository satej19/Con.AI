import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { issueMaterialSchema, returnMaterialSchema, idParamSchema } from '../validators/inventory.validator';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List inventory (all authenticated users)
router.get('/', asyncHandler(inventoryController.list));

// List transactions (all authenticated users)
router.get('/transactions', asyncHandler(inventoryController.listTransactions));

// Get single inventory item (all authenticated users)
router.get('/:id', validateParams(idParamSchema), asyncHandler(inventoryController.getById));

// Issue material (admin, manager)
router.post('/issue', requireManager, validateBody(issueMaterialSchema), asyncHandler(inventoryController.issue));

// Return material (admin, manager)
router.post('/return', requireManager, validateBody(returnMaterialSchema), asyncHandler(inventoryController.returnMaterial));

export default router;
