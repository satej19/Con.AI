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
const projectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    code: {
        type: String,
        required: [true, 'Project code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        immutable: true,
    },
    description: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Site location is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.PROJECT_STATUS),
        default: constants_1.PROJECT_STATUS.PLANNING,
        index: true,
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    expectedEndDate: {
        type: Date,
        required: [true, 'Expected end date is required'],
    },
    actualEndDate: {
        type: Date,
        default: null,
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [0, 'Budget must be non-negative'],
    },
    managerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project manager is required'],
        index: true,
    },
}, {
    timestamps: true,
});
projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ status: 1 });
projectSchema.index({ managerId: 1 });
const ProjectModel = mongoose_1.default.models['Project'] || mongoose_1.default.model('Project', projectSchema);
exports.default = ProjectModel;
//# sourceMappingURL=Project.model.js.map