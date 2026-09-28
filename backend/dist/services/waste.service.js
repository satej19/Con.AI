"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWasteRecordById = exports.getAllWasteRecords = exports.createWasteRecord = void 0;
const WasteRecord_model_1 = __importDefault(require("../models/WasteRecord.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const PurchaseOrder_model_1 = __importDefault(require("../models/PurchaseOrder.model"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const calculateAverageUnitPrice = async (materialId) => {
    const purchaseOrders = await PurchaseOrder_model_1.default.find({
        'items.materialId': materialId,
        status: { $in: ['approved', 'partially_received', 'received'] },
    });
    if (purchaseOrders.length === 0) {
        return 0;
    }
    let totalQuantity = 0;
    let totalCost = 0;
    for (const po of purchaseOrders) {
        for (const item of po.items) {
            if (item.materialId.toString() === materialId) {
                totalQuantity += item.quantity;
                totalCost += item.quantity * item.unitPrice;
            }
        }
    }
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
};
const createWasteRecord = async (input, userId) => {
    const material = await Material_model_1.default.findById(input.materialId);
    if (!material) {
        throw new AppError_1.AppError('Material not found', 404);
    }
    const project = await Project_model_1.default.findById(input.projectId);
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    const averageUnitPrice = await calculateAverageUnitPrice(input.materialId);
    const costImpact = input.quantity * averageUnitPrice;
    const wasteRecord = await WasteRecord_model_1.default.create({
        materialId: input.materialId,
        projectId: input.projectId,
        quantity: input.quantity,
        reason: input.reason,
        description: input.description,
        date: input.date ? new Date(input.date) : new Date(),
        reportedBy: userId,
        costImpact,
    });
    return wasteRecord;
};
exports.createWasteRecord = createWasteRecord;
const getAllWasteRecords = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { projectId, materialId, reason, startDate, endDate } = query;
    const filter = {};
    if (projectId) {
        filter.projectId = projectId;
    }
    if (materialId) {
        filter.materialId = materialId;
    }
    if (reason) {
        filter.reason = reason;
    }
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate);
        }
    }
    const wasteRecords = await WasteRecord_model_1.default.find(filter)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code')
        .populate('reportedBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
    const total = await WasteRecord_model_1.default.countDocuments(filter);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { wasteRecords, meta };
};
exports.getAllWasteRecords = getAllWasteRecords;
const getWasteRecordById = async (id) => {
    const wasteRecord = await WasteRecord_model_1.default.findById(id)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code')
        .populate('reportedBy', 'name');
    if (!wasteRecord) {
        throw new AppError_1.AppError('Waste record not found', 404);
    }
    return wasteRecord;
};
exports.getWasteRecordById = getWasteRecordById;
//# sourceMappingURL=waste.service.js.map