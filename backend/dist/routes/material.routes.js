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
const material_validator_1 = require("../validators/material.validator");
const materialController = __importStar(require("../controllers/material.controller"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Create material (admin, manager, store_keeper)
router.post('/', authorize_1.requireStoreKeeper, (0, validate_1.validateBody)(material_validator_1.createMaterialSchema), (0, asyncHandler_1.asyncHandler)(materialController.create));
// List materials (all authenticated users)
router.get('/', (0, validate_1.validateQuery)(material_validator_1.materialQuerySchema), (0, asyncHandler_1.asyncHandler)(materialController.list));
// Get single material (all authenticated users)
router.get('/:id', (0, validate_1.validateParams)(material_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(materialController.getById));
// Update material (admin, manager, store_keeper)
router.patch('/:id', authorize_1.requireStoreKeeper, (0, validate_1.validateParams)(material_validator_1.idParamSchema), (0, validate_1.validateBody)(material_validator_1.updateMaterialSchema), (0, asyncHandler_1.asyncHandler)(materialController.update));
exports.default = router;
//# sourceMappingURL=material.routes.js.map