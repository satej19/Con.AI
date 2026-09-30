"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const purchaseOrder_validator_1 = require("../validators/purchaseOrder.validator");
const purchaseOrderController = __importStar(require("../controllers/purchaseOrder.controller"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Create PO (admin, manager)
router.post('/', authorize_1.requireManager, (0, validate_1.validateBody)(purchaseOrder_validator_1.createPurchaseOrderSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.create));
// List POs (all authenticated users)
router.get('/', (0, validate_1.validateQuery)(purchaseOrder_validator_1.poQuerySchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.list));
// Get single PO (all authenticated users)
router.get('/:id', (0, validate_1.validateParams)(purchaseOrder_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.getById));
// Update PO (admin, manager) - only if draft
router.patch('/:id', authorize_1.requireManager, (0, validate_1.validateParams)(purchaseOrder_validator_1.idParamSchema), (0, validate_1.validateBody)(purchaseOrder_validator_1.updatePurchaseOrderSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.update));
// Approve PO (admin, manager)
router.patch('/:id/approve', authorize_1.requireManager, (0, validate_1.validateParams)(purchaseOrder_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.approve));
// Receive goods (admin, manager)
router.post('/:id/receive', authorize_1.requireManager, (0, validate_1.validateParams)(purchaseOrder_validator_1.idParamSchema), (0, validate_1.validateBody)(purchaseOrder_validator_1.receiveGoodsSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.receive));
// Cancel PO (admin, manager) - only if draft
router.patch('/:id/cancel', authorize_1.requireManager, (0, validate_1.validateParams)(purchaseOrder_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(purchaseOrderController.cancel));
exports.default = router;
//# sourceMappingURL=purchaseOrder.routes.js.map