"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateConsumptionPlanSchema = exports.createConsumptionPlanSchema = void 0;
const zod_1 = require("zod");
exports.createConsumptionPlanSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    materialId: zod_1.z.string().min(1, 'Material ID is required'),
    plannedQuantity: zod_1.z.number().min(0, 'Planned quantity cannot be negative'),
    plannedUnitCost: zod_1.z.number().min(0, 'Planned unit cost cannot be negative'),
    period: zod_1.z.string().min(1, 'Period is required'),
    notes: zod_1.z.string().optional(),
});
exports.updateConsumptionPlanSchema = zod_1.z.object({
    actualQuantity: zod_1.z.number().min(0, 'Actual quantity cannot be negative').optional(),
    actualUnitCost: zod_1.z.number().min(0, 'Actual unit cost cannot be negative').optional(),
    notes: zod_1.z.string().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=consumption.validator.js.map