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
const poItemSchema = new mongoose_1.Schema({
    materialId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Material',
        required: [true, 'Material reference is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be positive'],
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative'],
    },
    receivedQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Received quantity cannot be negative'],
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
    },
}, { _id: false });
const purchaseOrderSchema = new mongoose_1.Schema({
    poNumber: {
        type: String,
        required: [true, 'PO number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        immutable: true,
        index: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required'],
        index: true,
    },
    supplierId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: [true, 'Supplier is required'],
        index: true,
    },
    items: {
        type: [poItemSchema],
        required: true,
        validate: [(val) => val.length > 0, 'PO must have at least one item'],
    },
    status: {
        type: String,
        enum: Object.values(constants_1.PO_STATUS),
        default: constants_1.PO_STATUS.DRAFT,
        index: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    expectedDelivery: {
        type: Date,
        required: [true, 'Expected delivery date is required'],
    },
    actualDelivery: {
        type: Date,
        default: null,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative'],
    },
    notes: {
        type: String,
        trim: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by user is required'],
    },
}, {
    timestamps: true,
});
purchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ projectId: 1 });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
const PurchaseOrderModel = mongoose_1.default.models['PurchaseOrder'] ||
    mongoose_1.default.model('PurchaseOrder', purchaseOrderSchema);
exports.default = PurchaseOrderModel;
//# sourceMappingURL=PurchaseOrder.model.js.map