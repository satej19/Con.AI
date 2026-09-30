import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import { requireManager } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receiveGoodsSchema,
  poQuerySchema,
  idParamSchema,
} from '../validators/purchaseOrder.validator';
import * as purchaseOrderController from '../controllers/purchaseOrder.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create PO (admin, manager)
router.post(
  '/',
  requireManager,
  validateBody(createPurchaseOrderSchema),
  asyncHandler(purchaseOrderController.create)
);

// List POs (all authenticated users)
router.get(
  '/',
  validateQuery(poQuerySchema),
  asyncHandler(purchaseOrderController.list)
);

// Get single PO (all authenticated users)
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(purchaseOrderController.getById)
);

// Update PO (admin, manager) - only if draft
router.patch(
  '/:id',
  requireManager,
  validateParams(idParamSchema),
  validateBody(updatePurchaseOrderSchema),
  asyncHandler(purchaseOrderController.update)
);

// Approve PO (admin, manager)
router.patch(
  '/:id/approve',
  requireManager,
  validateParams(idParamSchema),
  asyncHandler(purchaseOrderController.approve)
);

// Receive goods (admin, manager)
router.post(
  '/:id/receive',
  requireManager,
  validateParams(idParamSchema),
  validateBody(receiveGoodsSchema),
  asyncHandler(purchaseOrderController.receive)
);

// Cancel PO (admin, manager) - only if draft
router.patch(
  '/:id/cancel',
  requireManager,
  validateParams(idParamSchema),
  asyncHandler(purchaseOrderController.cancel)
);

export default router;
