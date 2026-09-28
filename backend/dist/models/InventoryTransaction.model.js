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
const constants_1 = require("../config/constants");
const inventoryTransactionSchema = new mongoose_1.Schema({
    inventoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: [true, 'Inventory reference is required'],
        index: true,
    },
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
    type: {
        type: String,
        enum: Object.values(constants_1.TRANSACTION_TYPE),
        required: [true, 'Transaction type is required'],
        index: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.001, 'Quantity must be positive'],
    },
    previousStock: {
        type: Number,
        required: [true, 'Previous stock is required'],
    },
    newStock: {
        type: Number,
        required: [true, 'New stock is required'],
    },
    referenceType: {
        type: String,
        enum: Object.values(constants_1.REFERENCE_TYPE),
        required: [true, 'Reference type is required'],
    },
    referenceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: [0, 'Unit price cannot be negative'],
    },
    totalCost: {
        type: Number,
        default: 0,
        min: [0, 'Total cost cannot be negative'],
    },
    performedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Performed by user is required'],
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
inventoryTransactionSchema.index({ inventoryId: 1 });
inventoryTransactionSchema.index({ projectId: 1, materialId: 1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });
const InventoryTransactionModel = mongoose_1.default.models['InventoryTransaction'] ||
    mongoose_1.default.model('InventoryTransaction', inventoryTransactionSchema);
exports.default = InventoryTransactionModel;
//# sourceMappingURL=InventoryTransaction.model.js.map