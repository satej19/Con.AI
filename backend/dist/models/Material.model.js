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
const materialSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
        trim: true,
        uppercase: true,
        immutable: true,
    },
    category: {
        type: String,
        enum: Object.values(constants_1.MATERIAL_CATEGORY),
        required: [true, 'Category is required'],
    },
    unit: {
        type: String,
        enum: Object.values(constants_1.MATERIAL_UNIT),
        required: [true, 'Unit is required'],
    },
    description: {
        type: String,
        trim: true,
    },
    hsnCode: {
        type: String,
        trim: true,
    },
    reorderLevel: {
        type: Number,
        default: 0,
        min: [0, 'Reorder level cannot be negative'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
materialSchema.index({ code: 1 }, { unique: true });
materialSchema.index({ category: 1 });
materialSchema.index({ name: 'text' });
const MaterialModel = mongoose_1.default.models['Material'] || mongoose_1.default.model('Material', materialSchema);
exports.default = MaterialModel;
//# sourceMappingURL=Material.model.js.map