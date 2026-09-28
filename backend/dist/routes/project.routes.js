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
const project_validator_1 = require("../validators/project.validator");
const projectController = __importStar(require("../controllers/project.controller"));
const router = (0, express_1.Router)();
// All project routes require authentication
router.use(authenticate_1.authenticate);
router.post('/', authorize_1.requireManager, (0, validate_1.validateBody)(project_validator_1.createProjectSchema), (0, asyncHandler_1.asyncHandler)(projectController.create));
router.get('/', (0, validate_1.validateQuery)(project_validator_1.projectQuerySchema), (0, asyncHandler_1.asyncHandler)(projectController.list));
router.get('/:id', (0, validate_1.validateParams)(project_validator_1.projectIdParamSchema), (0, asyncHandler_1.asyncHandler)(projectController.getById));
router.patch('/:id', authorize_1.requireManager, (0, validate_1.validateParams)(project_validator_1.projectIdParamSchema), (0, validate_1.validateBody)(project_validator_1.updateProjectSchema), (0, asyncHandler_1.asyncHandler)(projectController.update));
exports.default = router;
//# sourceMappingURL=project.routes.js.map