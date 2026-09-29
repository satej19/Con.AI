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
const zod_1 = require("zod");
const asyncHandler_1 = require("../middleware/asyncHandler");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const consumption_validator_1 = require("../validators/consumption.validator");
const consumptionController = __importStar(require("../controllers/consumption.controller"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
// Create consumption plan (admin, manager, engineer)
router.post('/', authorize_1.requirePlanner, (0, validate_1.validateBody)(consumption_validator_1.createConsumptionPlanSchema), (0, asyncHandler_1.asyncHandler)(consumptionController.create));
// List consumption plans (all authenticated users)
router.get('/', (0, validate_1.validateQuery)(zod_1.z.object({
    projectId: zod_1.z.string().optional(),
    period: zod_1.z.string().optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
})), (0, asyncHandler_1.asyncHandler)(consumptionController.list));
// Get aggregated variance report (all authenticated users)
router.get('/report', (0, validate_1.validateQuery)(zod_1.z.object({
    projectId: zod_1.z.string(),
    period: zod_1.z.string().optional(),
})), (0, asyncHandler_1.asyncHandler)(consumptionController.getReport));
// Get single consumption plan (all authenticated users)
router.get('/:id', (0, validate_1.validateParams)(consumption_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(consumptionController.getById));
// Update consumption plan (admin, manager, engineer)
router.patch('/:id', authorize_1.requirePlanner, (0, validate_1.validateParams)(consumption_validator_1.idParamSchema), (0, validate_1.validateBody)(consumption_validator_1.updateConsumptionPlanSchema), (0, asyncHandler_1.asyncHandler)(consumptionController.update));
// Get variance analysis for single plan (all authenticated users)
router.get('/:id/variance', (0, validate_1.validateParams)(consumption_validator_1.idParamSchema), (0, asyncHandler_1.asyncHandler)(consumptionController.getVariance));
exports.default = router;
//# sourceMappingURL=consumption.routes.js.map