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
const supplier_validator_1 = require("../validators/supplier.validator");
const supplierController = __importStar(require("../controllers/supplier.controller"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Create supplier (admin, manager)
router.post('/', authorize_1.requireManager, (0, validate_1.validateBody)(supplier_validator_1.createSupplierSchema), (0, asyncHandler_1.asyncHandler)(supplierController.create));
// List suppliers (all authenticated users)
router.get('/', (0, validate_1.validateQuery)(supplier_validator_1.supplierQuerySchema), (0, asyncHandler_1.asyncHandler)(supplierController.list));
// Get single supplier (all authenticated users)
router.get('/:id', (0, validate_1.validateParams)(supplier_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(supplierController.getById));
// Update supplier (admin, manager)
router.patch('/:id', authorize_1.requireManager, (0, validate_1.validateParams)(supplier_validator_1.idParamSchema), (0, validate_1.validateBody)(supplier_validator_1.updateSupplierSchema), (0, asyncHandler_1.asyncHandler)(supplierController.update));
exports.default = router;
//# sourceMappingURL=supplier.routes.js.map