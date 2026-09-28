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
const mongoose_1 = __importStar(require("mongoose"));
const wasteRecordSchema = new mongoose_1.Schema({
    materialId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Material',
        required: [true, 'Material reference is required'],
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project reference is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be positive'],
    },
    reason: {
        type: String,
        enum: ['damaged', 'expired', 'spillage', 'defective', 'overuse', 'natural_loss', 'other'],
        required: [true, 'Reason is required'],
    },
    description: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now,
    },
    reportedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reported by is required'],
    },
    costImpact: {
        type: Number,
        required: [true, 'Cost impact is required'],
        min: [0, 'Cost impact cannot be negative'],
    },
}, {
    timestamps: true,
});
wasteRecordSchema.index({ projectId: 1, date: -1 });
wasteRecordSchema.index({ materialId: 1, date: -1 });
wasteRecordSchema.index({ reason: 1 });
const WasteRecordModel = mongoose_1.default.models['WasteRecord'] || mongoose_1.default.model('WasteRecord', wasteRecordSchema);
exports.default = WasteRecordModel;
//# sourceMappingURL=WasteRecord.model.js.map