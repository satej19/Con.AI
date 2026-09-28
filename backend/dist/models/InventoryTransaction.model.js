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
const inventoryTransactionSchema = new mongoose_1.Schema({
    inventoryId: {
        type: String,
        required: [true, 'Inventory reference is required'],
    },
    materialId: {
        type: String,
        required: [true, 'Material reference is required'],
    },
    projectId: {
        type: String,
        required: [true, 'Project reference is required'],
    },
    type: {
        type: String,
        enum: ['RECEIVE', 'ISSUE', 'RETURN'],
        required: [true, 'Transaction type is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be positive'],
    },
    balanceAfter: {
        type: Number,
        required: [true, 'Balance after is required'],
    },
    referenceType: {
        type: String,
        enum: ['purchase_order', 'manual', 'waste_return'],
        required: [true, 'Reference type is required'],
    },
    referenceId: {
        type: String,
        required: [true, 'Reference ID is required'],
    },
    performedBy: {
        type: String,
        required: [true, 'Performed by is required'],
    },
    notes: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
inventoryTransactionSchema.index({ inventoryId: 1, date: -1 });
inventoryTransactionSchema.index({ materialId: 1, date: -1 });
inventoryTransactionSchema.index({ projectId: 1, type: 1, date: -1 });
inventoryTransactionSchema.index({ type: 1, date: -1 });
const InventoryTransactionModel = mongoose_1.default.models['InventoryTransaction'] || mongoose_1.default.model('InventoryTransaction', inventoryTransactionSchema);
exports.default = InventoryTransactionModel;
//# sourceMappingURL=InventoryTransaction.model.js.map