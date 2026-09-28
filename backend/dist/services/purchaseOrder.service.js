"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPurchaseOrder = exports.receiveGoods = exports.approvePurchaseOrder = exports.updatePurchaseOrder = exports.getPurchaseOrderById = exports.getAllPurchaseOrders = exports.createPurchaseOrder = void 0;
const mongoose_1 = require("mongoose");
const PurchaseOrder_model_1 = __importDefault(require("../models/PurchaseOrder.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Supplier_model_1 = __importDefault(require("../models/Supplier.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Inventory_model_1 = __importDefault(require("../models/Inventory.model"));
const InventoryTransaction_model_1 = __importDefault(require("../models/InventoryTransaction.model"));
const constants_1 = require("../config/constants");
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const generatePONumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `PO-${year}${month}${day}`;
    for (let attempt = 0; attempt < 5; attempt++) {
        const random = Math.floor(1000 + Math.random() * 9000).toString();
        const poNumber = `${datePrefix}-${random}`;
        const exists = await PurchaseOrder_model_1.default.findOne({ poNumber });
        if (!exists) {
            return poNumber;
        }
    }
    return `${datePrefix}-${Date.now().toString().slice(-4)}`;
};
const createPurchaseOrder = async (input, userId) => {
    const project = await Project_model_1.default.findById(input.projectId);
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    const supplier = await Supplier_model_1.default.findById(input.supplierId);
    if (!supplier) {
        throw new AppError_1.AppError('Supplier not found', 404);
    }
    if (!supplier.isActive) {
        throw new AppError_1.AppError('Cannot create purchase order for an inactive supplier', 400);
    }
    const uniqueMaterialIds = Array.from(new Set(input.items.map((i) => i.materialId)));
    const materials = await Material_model_1.default.find({ _id: { $in: uniqueMaterialIds } });
    if (materials.length !== uniqueMaterialIds.length) {
        throw new AppError_1.AppError('One or more material IDs are invalid', 400);
    }
    // Business Rule: Deactivated materials cannot be added to new POs
    const inactiveMaterial = materials.find((m) => !m.isActive);
    if (inactiveMaterial) {
        throw new AppError_1.AppError(`Material '${inactiveMaterial.name}' is deactivated and cannot be added to a new purchase order`, 400);
    }
    const itemsWithTotal = input.items.map((item) => ({
        materialId: new mongoose_1.Types.ObjectId(item.materialId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        receivedQuantity: 0,
        totalPrice: item.quantity * item.unitPrice,
    }));
    const totalAmount = itemsWithTotal.reduce((sum, item) => sum + item.totalPrice, 0);
    const poNumber = await generatePONumber();
    const purchaseOrder = new PurchaseOrder_model_1.default({
        poNumber,
        projectId: project._id,
        supplierId: supplier._id,
        items: itemsWithTotal,
        expectedDelivery: input.expectedDelivery,
        totalAmount,
        notes: input.notes,
        status: constants_1.PO_STATUS.DRAFT,
        createdBy: new mongoose_1.Types.ObjectId(userId),
    });
    await purchaseOrder.save();
    return purchaseOrder.populate([
        { path: 'projectId', select: 'name code location status' },
        { path: 'supplierId', select: 'name code contactPerson' },
        { path: 'items.materialId', select: 'name code unit category' },
        { path: 'createdBy', select: 'name email role' },
    ]);
};
exports.createPurchaseOrder = createPurchaseOrder;
const getAllPurchaseOrders = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { projectId, supplierId, status } = query;
    const filter = {};
    if (projectId)
        filter['projectId'] = projectId;
    if (supplierId)
        filter['supplierId'] = supplierId;
    if (status)
        filter['status'] = status;
    const [purchaseOrders, total] = await Promise.all([
        PurchaseOrder_model_1.default.find(filter)
            .populate('projectId', 'name code location')
            .populate('supplierId', 'name code contactPerson')
            .populate('items.materialId', 'name code unit category')
            .populate('createdBy', 'name email role')
            .populate('approvedBy', 'name email role')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit),
        PurchaseOrder_model_1.default.countDocuments(filter),
    ]);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { purchaseOrders, meta };
};
exports.getAllPurchaseOrders = getAllPurchaseOrders;
const getPurchaseOrderById = async (id) => {
    const purchaseOrder = await PurchaseOrder_model_1.default.findById(id)
        .populate('projectId', 'name code location')
        .populate('supplierId', 'name code contactPerson phone email')
        .populate('items.materialId', 'name code unit category reorderLevel')
        .populate('createdBy', 'name email role')
        .populate('approvedBy', 'name email role');
    if (!purchaseOrder) {
        throw new AppError_1.AppError('Purchase order not found', 404);
    }
    return purchaseOrder;
};
exports.getPurchaseOrderById = getPurchaseOrderById;
const updatePurchaseOrder = async (id, input) => {
    const purchaseOrder = await PurchaseOrder_model_1.default.findById(id);
    if (!purchaseOrder) {
        throw new AppError_1.AppError('Purchase order not found', 404);
    }
    // Business Rule: Only draft purchase orders can be updated
    if (purchaseOrder.status !== constants_1.PO_STATUS.DRAFT) {
        throw new AppError_1.AppError('Only draft purchase orders can be updated', 400);
    }
    if (input.supplierId) {
        const supplier = await Supplier_model_1.default.findById(input.supplierId);
        if (!supplier) {
            throw new AppError_1.AppError('Supplier not found', 404);
        }
        purchaseOrder.supplierId = supplier._id;
    }
    if (input.items && input.items.length > 0) {
        const uniqueMaterialIds = Array.from(new Set(input.items.map((i) => i.materialId)));
        const materials = await Material_model_1.default.find({ _id: { $in: uniqueMaterialIds } });
        if (materials.length !== uniqueMaterialIds.length) {
            throw new AppError_1.AppError('One or more material IDs are invalid', 400);
        }
        const inactiveMaterial = materials.find((m) => !m.isActive);
        if (inactiveMaterial) {
            throw new AppError_1.AppError(`Material '${inactiveMaterial.name}' is deactivated and cannot be added to a purchase order`, 400);
        }
        purchaseOrder.items = input.items.map((item) => ({
            materialId: new mongoose_1.Types.ObjectId(item.materialId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            receivedQuantity: 0,
            totalPrice: item.quantity * item.unitPrice,
        }));
        purchaseOrder.totalAmount = purchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    if (input.expectedDelivery !== undefined) {
        purchaseOrder.expectedDelivery = input.expectedDelivery;
    }
    if (input.notes !== undefined) {
        purchaseOrder.notes = input.notes;
    }
    await purchaseOrder.save();
    return purchaseOrder.populate([
        { path: 'projectId', select: 'name code location' },
        { path: 'supplierId', select: 'name code contactPerson' },
        { path: 'items.materialId', select: 'name code unit category' },
        { path: 'createdBy', select: 'name email role' },
    ]);
};
exports.updatePurchaseOrder = updatePurchaseOrder;
const approvePurchaseOrder = async (id, userId) => {
    const purchaseOrder = await PurchaseOrder_model_1.default.findById(id);
    if (!purchaseOrder) {
        throw new AppError_1.AppError('Purchase order not found', 404);
    }
    // Business Rule: Only draft purchase orders can be approved
    if (purchaseOrder.status !== constants_1.PO_STATUS.DRAFT) {
        throw new AppError_1.AppError(`Cannot approve purchase order with status '${purchaseOrder.status}'`, 400);
    }
    purchaseOrder.status = constants_1.PO_STATUS.APPROVED;
    purchaseOrder.approvedBy = new mongoose_1.Types.ObjectId(userId);
    await purchaseOrder.save();
    return purchaseOrder.populate([
        { path: 'projectId', select: 'name code' },
        { path: 'supplierId', select: 'name code' },
        { path: 'approvedBy', select: 'name email role' },
    ]);
};
exports.approvePurchaseOrder = approvePurchaseOrder;
const receiveGoods = async (id, input, userId) => {
    const purchaseOrder = await PurchaseOrder_model_1.default.findById(id);
    if (!purchaseOrder) {
        throw new AppError_1.AppError('Purchase order not found', 404);
    }
    // Business Rule: Goods can only be received on approved or partially_received orders
    if (purchaseOrder.status !== constants_1.PO_STATUS.APPROVED &&
        purchaseOrder.status !== constants_1.PO_STATUS.PARTIALLY_RECEIVED) {
        throw new AppError_1.AppError(`Cannot receive goods on purchase order with status '${purchaseOrder.status}'. Order must be approved first.`, 400);
    }
    for (const receivedItem of input.items) {
        const poItem = purchaseOrder.items.find((item) => item.materialId.toString() === receivedItem.materialId);
        if (!poItem) {
            throw new AppError_1.AppError(`Material ${receivedItem.materialId} not found in this purchase order`, 400);
        }
        if (poItem.receivedQuantity + receivedItem.quantity > poItem.quantity) {
            throw new AppError_1.AppError(`Cannot receive ${receivedItem.quantity} for material ${receivedItem.materialId}. Already received: ${poItem.receivedQuantity}, ordered: ${poItem.quantity}`, 400);
        }
        // 1. Update PO item received quantity
        poItem.receivedQuantity += receivedItem.quantity;
        // 2. Find or create Inventory record for (projectId, materialId)
        let inventory = await Inventory_model_1.default.findOne({
            projectId: purchaseOrder.projectId,
            materialId: poItem.materialId,
        });
        if (!inventory) {
            inventory = new Inventory_model_1.default({
                projectId: purchaseOrder.projectId,
                materialId: poItem.materialId,
                currentStock: 0,
                lastUpdated: new Date(),
            });
        }
        const previousStock = inventory.currentStock;
        const newStock = previousStock + receivedItem.quantity;
        inventory.currentStock = newStock;
        inventory.lastUpdated = new Date();
        await inventory.save();
        // 3. Create InventoryTransaction of type RECEIVE
        const totalCost = receivedItem.quantity * poItem.unitPrice;
        await InventoryTransaction_model_1.default.create({
            inventoryId: inventory._id,
            materialId: poItem.materialId,
            projectId: purchaseOrder.projectId,
            type: constants_1.TRANSACTION_TYPE.RECEIVE,
            quantity: receivedItem.quantity,
            previousStock,
            newStock,
            referenceType: constants_1.REFERENCE_TYPE.PURCHASE_ORDER,
            referenceId: purchaseOrder._id,
            unitPrice: poItem.unitPrice,
            totalCost,
            performedBy: new mongoose_1.Types.ObjectId(userId),
            notes: `Received via PO ${purchaseOrder.poNumber}`,
        });
    }
    // 4. Update overall PO status
    const allReceived = purchaseOrder.items.every((item) => item.receivedQuantity >= item.quantity);
    if (allReceived) {
        purchaseOrder.status = constants_1.PO_STATUS.RECEIVED;
        purchaseOrder.actualDelivery = new Date();
    }
    else {
        purchaseOrder.status = constants_1.PO_STATUS.PARTIALLY_RECEIVED;
    }
    await purchaseOrder.save();
    return purchaseOrder.populate([
        { path: 'projectId', select: 'name code location' },
        { path: 'supplierId', select: 'name code contactPerson' },
        { path: 'items.materialId', select: 'name code unit category' },
        { path: 'approvedBy', select: 'name email role' },
    ]);
};
exports.receiveGoods = receiveGoods;
const cancelPurchaseOrder = async (id) => {
    const purchaseOrder = await PurchaseOrder_model_1.default.findById(id);
    if (!purchaseOrder) {
        throw new AppError_1.AppError('Purchase order not found', 404);
    }
    // Business Rule: Only draft purchase orders can be cancelled
    if (purchaseOrder.status !== constants_1.PO_STATUS.DRAFT) {
        throw new AppError_1.AppError(`Cannot cancel purchase order with status '${purchaseOrder.status}'. Only draft orders can be cancelled.`, 400);
    }
    purchaseOrder.status = constants_1.PO_STATUS.CANCELLED;
    await purchaseOrder.save();
    return purchaseOrder;
};
exports.cancelPurchaseOrder = cancelPurchaseOrder;
//# sourceMappingURL=purchaseOrder.service.js.map