"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.receiveMaterial = exports.returnMaterial = exports.issueMaterial = exports.getInventoryById = exports.getAllInventory = void 0;
const Inventory_model_1 = __importDefault(require("../models/Inventory.model"));
const InventoryTransaction_model_1 = __importDefault(require("../models/InventoryTransaction.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllInventory = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { projectId, lowStock } = query;
    const filter = {};
    if (projectId) {
        filter.projectId = projectId;
    }
    let inventoryQuery = Inventory_model_1.default.find(filter)
        .populate('materialId', 'name code unit category reorderLevel')
        .populate('projectId', 'name code')
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit);
    let inventory = await inventoryQuery;
    if (lowStock === 'true') {
        inventory = inventory.filter(item => {
            const material = item.materialId;
            return material && item.currentStock <= material.reorderLevel;
        });
    }
    const total = await Inventory_model_1.default.countDocuments(filter);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { inventory, meta };
};
exports.getAllInventory = getAllInventory;
const getInventoryById = async (id) => {
    const inventory = await Inventory_model_1.default.findById(id)
        .populate('materialId', 'name code unit category reorderLevel')
        .populate('projectId', 'name code');
    if (!inventory) {
        throw new AppError_1.AppError('Inventory not found', 404);
    }
    return inventory;
};
exports.getInventoryById = getInventoryById;
const issueMaterial = async (input, userId) => {
    const useTransactions = process.env['NODE_ENV'] === 'production';
    let session = null;
    if (useTransactions) {
        session = await mongoose_1.default.startSession();
        session.startTransaction();
    }
    try {
        const material = await Material_model_1.default.findById(input.materialId).session(session);
        if (!material) {
            throw new AppError_1.AppError('Material not found', 404);
        }
        const project = await Project_model_1.default.findById(input.projectId).session(session);
        if (!project) {
            throw new AppError_1.AppError('Project not found', 404);
        }
        let inventory = await Inventory_model_1.default.findOne({
            materialId: input.materialId,
            projectId: input.projectId,
        }).session(session);
        if (!inventory) {
            throw new AppError_1.AppError('No stock found for this material on this project. Receive goods via a Purchase Order first before issuing.', 404);
        }
        if (inventory.currentStock < input.quantity) {
            throw new AppError_1.AppError('Insufficient stock', 400);
        }
        inventory.currentStock -= input.quantity;
        inventory.lastUpdated = new Date();
        await inventory.save(session ? { session } : {});
        const transactionData = {
            inventoryId: inventory._id,
            materialId: input.materialId,
            projectId: input.projectId,
            type: 'ISSUE',
            quantity: input.quantity,
            balanceAfter: inventory.currentStock,
            referenceType: 'manual',
            referenceId: inventory._id,
            performedBy: userId,
            notes: input.notes,
            date: new Date(),
        };
        if (session) {
            await InventoryTransaction_model_1.default.create([transactionData], { session });
        }
        else {
            await InventoryTransaction_model_1.default.create(transactionData);
        }
        if (useTransactions && session) {
            await session.commitTransaction();
            session.endSession();
        }
        const updatedInventory = await Inventory_model_1.default.findById(inventory._id)
            .populate('materialId', 'name code unit category')
            .populate('projectId', 'name code');
        return updatedInventory;
    }
    catch (error) {
        if (useTransactions && session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};
exports.issueMaterial = issueMaterial;
const returnMaterial = async (input, userId) => {
    const useTransactions = process.env['NODE_ENV'] === 'production';
    let session = null;
    if (useTransactions) {
        session = await mongoose_1.default.startSession();
        session.startTransaction();
    }
    try {
        const material = await Material_model_1.default.findById(input.materialId).session(session);
        if (!material) {
            throw new AppError_1.AppError('Material not found', 404);
        }
        const project = await Project_model_1.default.findById(input.projectId).session(session);
        if (!project) {
            throw new AppError_1.AppError('Project not found', 404);
        }
        let inventory = await Inventory_model_1.default.findOne({
            materialId: input.materialId,
            projectId: input.projectId,
        }).session(session);
        if (!inventory) {
            const inventoryData = {
                materialId: input.materialId,
                projectId: input.projectId,
                currentStock: 0,
                lastUpdated: new Date(),
            };
            if (session) {
                const createdInventory = await Inventory_model_1.default.create([inventoryData], { session });
                inventory = createdInventory[0];
            }
            else {
                inventory = await Inventory_model_1.default.create(inventoryData);
            }
        }
        if (!inventory) {
            throw new AppError_1.AppError('Failed to create inventory record', 500);
        }
        inventory.currentStock += input.quantity;
        inventory.lastUpdated = new Date();
        await inventory.save(session ? { session } : {});
        const transactionData = {
            inventoryId: inventory._id,
            materialId: input.materialId,
            projectId: input.projectId,
            type: 'RETURN',
            quantity: input.quantity,
            balanceAfter: inventory.currentStock,
            referenceType: 'manual',
            referenceId: inventory._id,
            performedBy: userId,
            notes: input.notes,
            date: new Date(),
        };
        if (session) {
            await InventoryTransaction_model_1.default.create([transactionData], { session });
        }
        else {
            await InventoryTransaction_model_1.default.create(transactionData);
        }
        if (useTransactions && session) {
            await session.commitTransaction();
            session.endSession();
        }
        const updatedInventory = await Inventory_model_1.default.findById(inventory._id)
            .populate('materialId', 'name code unit category')
            .populate('projectId', 'name code');
        return updatedInventory;
    }
    catch (error) {
        if (useTransactions && session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};
exports.returnMaterial = returnMaterial;
const receiveMaterial = async (materialId, projectId, quantity, referenceId, userId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let inventory = await Inventory_model_1.default.findOne({
            materialId,
            projectId,
        }).session(session);
        if (!inventory) {
            const createdInventory = await Inventory_model_1.default.create([{
                    materialId,
                    projectId,
                    currentStock: 0,
                    lastUpdated: new Date(),
                }], { session });
            inventory = createdInventory[0];
        }
        if (!inventory) {
            throw new AppError_1.AppError('Failed to create inventory record', 500);
        }
        inventory.currentStock += quantity;
        inventory.lastUpdated = new Date();
        await inventory.save({ session });
        await InventoryTransaction_model_1.default.create([{
                inventoryId: inventory._id,
                materialId,
                projectId,
                type: 'RECEIVE',
                quantity,
                balanceAfter: inventory.currentStock,
                referenceType: 'purchase_order',
                referenceId,
                performedBy: userId,
                date: new Date(),
            }], { session });
        await session.commitTransaction();
        session.endSession();
        const updatedInventory = await Inventory_model_1.default.findById(inventory._id)
            .populate('materialId', 'name code unit category')
            .populate('projectId', 'name code');
        return updatedInventory;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
exports.receiveMaterial = receiveMaterial;
const getTransactions = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { projectId, materialId, type, startDate, endDate } = query;
    const filter = {};
    if (projectId) {
        filter.projectId = projectId;
    }
    if (materialId) {
        filter.materialId = materialId;
    }
    if (type) {
        filter.type = type;
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
    const transactions = await InventoryTransaction_model_1.default.find(filter)
        .populate('materialId', 'name code unit')
        .populate('projectId', 'name code')
        .populate('performedBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
    const total = await InventoryTransaction_model_1.default.countDocuments(filter);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { transactions, meta };
};
exports.getTransactions = getTransactions;
//# sourceMappingURL=inventory.service.js.map