import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
  idParamSchema,
} from '../validators/supplier.validator';
import * as supplierController from '../controllers/supplier.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create supplier (admin, manager)
router.post(
  '/',
  requireManager,
  validateBody(createSupplierSchema),
  asyncHandler(supplierController.create)
);

// List suppliers (all authenticated users)
router.get(
  '/',
  validateQuery(supplierQuerySchema),
  asyncHandler(supplierController.list)
);

// Get single supplier (all authenticated users)
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(supplierController.getById)
);

// Update supplier (admin, manager)
router.patch(
  '/:id',
  requireManager,
  validateParams(idParamSchema),
  validateBody(updateSupplierSchema),
  asyncHandler(supplierController.update)
);

export default router;
