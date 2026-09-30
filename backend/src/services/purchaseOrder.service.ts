import mongoose, { Types } from 'mongoose';
import PurchaseOrder, { IPurchaseOrder } from '../models/PurchaseOrder.model';
import Project from '../models/Project.model';
import Supplier from '../models/Supplier.model';
import Material from '../models/Material.model';
import Inventory from '../models/Inventory.model';
import InventoryTransaction from '../models/InventoryTransaction.model';
import { PO_STATUS, TRANSACTION_TYPE, REFERENCE_TYPE } from '../config/constants';
import { AppError } from '../utils/AppError';
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceiveGoodsInput,
  POQueryInput,
} from '../validators/purchaseOrder.validator';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../utils/pagination';

const generatePONumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `PO-${year}${month}${day}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    const poNumber = `${datePrefix}-${random}`;
    const exists = await PurchaseOrder.findOne({ poNumber });
    if (!exists) {
      return poNumber;
    }
  }

  return `${datePrefix}-${Date.now().toString().slice(-4)}`;
};

export const createPurchaseOrder = async (
  input: CreatePurchaseOrderInput,
  userId: string
): Promise<IPurchaseOrder> => {
  const project = await Project.findById(input.projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const supplier = await Supplier.findById(input.supplierId);
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  if (!supplier.isActive) {
    throw new AppError('Cannot create purchase order for an inactive supplier', 400);
  }

  const uniqueMaterialIds = Array.from(new Set(input.items.map((i) => i.materialId)));
  const materials = await Material.find({ _id: { $in: uniqueMaterialIds } });

  if (materials.length !== uniqueMaterialIds.length) {
    throw new AppError('One or more material IDs are invalid', 400);
  }

  // Business Rule: Deactivated materials cannot be added to new POs
  const inactiveMaterial = materials.find((m) => !m.isActive);
  if (inactiveMaterial) {
    throw new AppError(
      `Material '${inactiveMaterial.name}' is deactivated and cannot be added to a new purchase order`,
      400
    );
  }

  const itemsWithTotal = input.items.map((item) => ({
    materialId: new Types.ObjectId(item.materialId),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    receivedQuantity: 0,
    totalPrice: item.quantity * item.unitPrice,
  }));

  const totalAmount = itemsWithTotal.reduce((sum, item) => sum + item.totalPrice, 0);
  const poNumber = await generatePONumber();

  const purchaseOrder = new PurchaseOrder({
    poNumber,
    projectId: project._id,
    supplierId: supplier._id,
    items: itemsWithTotal,
    expectedDelivery: input.expectedDelivery,
    totalAmount,
    notes: input.notes,
    status: PO_STATUS.DRAFT,
    createdBy: new Types.ObjectId(userId),
  });

  await purchaseOrder.save();
  return purchaseOrder.populate([
    { path: 'projectId', select: 'name code location status' },
    { path: 'supplierId', select: 'name code contactPerson' },
    { path: 'items.materialId', select: 'name code unit category' },
    { path: 'createdBy', select: 'name email role' },
  ]);
};

export const getAllPurchaseOrders = async (
  query: POQueryInput
): Promise<{ purchaseOrders: IPurchaseOrder[]; meta: PaginationMeta }> => {
  const { page, limit, skip } = parsePagination(query);
  const { projectId, supplierId, status } = query;

  const filter: Record<string, any> = {};
  if (projectId) filter['projectId'] = projectId;
  if (supplierId) filter['supplierId'] = supplierId;
  if (status) filter['status'] = status;

  const [purchaseOrders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('projectId', 'name code location')
      .populate('supplierId', 'name code contactPerson')
      .populate('items.materialId', 'name code unit category')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit),
    PurchaseOrder.countDocuments(filter),
  ]);

  const meta = buildPaginationMeta(page, limit, total);
  return { purchaseOrders, meta };
};

export const getPurchaseOrderById = async (id: string): Promise<IPurchaseOrder> => {
  const purchaseOrder = await PurchaseOrder.findById(id)
    .populate('projectId', 'name code location')
    .populate('supplierId', 'name code contactPerson phone email')
    .populate('items.materialId', 'name code unit category reorderLevel')
    .populate('createdBy', 'name email role')
    .populate('approvedBy', 'name email role');

  if (!purchaseOrder) {
    throw new AppError('Purchase order not found', 404);
  }
  return purchaseOrder;
};

export const updatePurchaseOrder = async (
  id: string,
  input: UpdatePurchaseOrderInput
): Promise<IPurchaseOrder> => {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) {
    throw new AppError('Purchase order not found', 404);
  }

  // Business Rule: Only draft purchase orders can be updated
  if (purchaseOrder.status !== PO_STATUS.DRAFT) {
    throw new AppError('Only draft purchase orders can be updated', 400);
  }

  if (input.supplierId) {
    const supplier = await Supplier.findById(input.supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }
    purchaseOrder.supplierId = supplier._id as any;
  }

  if (input.items && input.items.length > 0) {
    const uniqueMaterialIds = Array.from(new Set(input.items.map((i) => i.materialId)));
    const materials = await Material.find({ _id: { $in: uniqueMaterialIds } });

    if (materials.length !== uniqueMaterialIds.length) {
      throw new AppError('One or more material IDs are invalid', 400);
    }

    const inactiveMaterial = materials.find((m) => !m.isActive);
    if (inactiveMaterial) {
      throw new AppError(
        `Material '${inactiveMaterial.name}' is deactivated and cannot be added to a purchase order`,
        400
      );
    }

    purchaseOrder.items = input.items.map((item) => ({
      materialId: new Types.ObjectId(item.materialId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      receivedQuantity: 0,
      totalPrice: item.quantity * item.unitPrice,
    }));

    purchaseOrder.totalAmount = purchaseOrder.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
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

export const approvePurchaseOrder = async (
  id: string,
  userId: string
): Promise<IPurchaseOrder> => {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) {
    throw new AppError('Purchase order not found', 404);
  }

  // Business Rule: Only draft purchase orders can be approved
  if (purchaseOrder.status !== PO_STATUS.DRAFT) {
    throw new AppError(`Cannot approve purchase order with status '${purchaseOrder.status}'`, 400);
  }

  purchaseOrder.status = PO_STATUS.APPROVED;
  purchaseOrder.approvedBy = new Types.ObjectId(userId);
  await purchaseOrder.save();

  return purchaseOrder.populate([
    { path: 'projectId', select: 'name code' },
    { path: 'supplierId', select: 'name code' },
    { path: 'approvedBy', select: 'name email role' },
  ]);
};

export const receiveGoods = async (
  id: string,
  input: ReceiveGoodsInput,
  userId: string
): Promise<IPurchaseOrder> => {
  // Check if we're in a replica set environment
  const useTransactions = process.env['NODE_ENV'] === 'production';
  let session = null;
  
  if (useTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    const purchaseOrder = await PurchaseOrder.findById(id).session(session);
    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Business Rule: Goods can only be received on approved or partially_received orders
    if (
      purchaseOrder.status !== PO_STATUS.APPROVED &&
      purchaseOrder.status !== PO_STATUS.PARTIALLY_RECEIVED
    ) {
      throw new AppError(
        `Cannot receive goods on purchase order with status '${purchaseOrder.status}'. Order must be approved first.`,
        400
      );
    }

    for (const receivedItem of input.items) {
      const poItem = purchaseOrder.items.find(
        (item) => item.materialId.toString() === receivedItem.materialId
      );

      if (!poItem) {
        throw new AppError(
          `Material ${receivedItem.materialId} not found in this purchase order`,
          400
        );
      }

      if (poItem.receivedQuantity + receivedItem.quantity > poItem.quantity) {
        throw new AppError(
          `Cannot receive ${receivedItem.quantity} for material ${receivedItem.materialId}. Already received: ${poItem.receivedQuantity}, ordered: ${poItem.quantity}`,
          400
        );
      }

      // 1. Update PO item received quantity
      poItem.receivedQuantity += receivedItem.quantity;

      // 2. Find or create Inventory record for (projectId, materialId)
      let inventory = await Inventory.findOne({
        projectId: purchaseOrder.projectId,
        materialId: poItem.materialId,
      }).session(session);

      if (!inventory) {
        inventory = new Inventory({
          projectId: purchaseOrder.projectId,
          materialId: poItem.materialId,
          currentStock: 0,
          lastUpdated: new Date(),
        });
        await inventory.save(session ? { session } : {});
      }

      const previousStock = inventory.currentStock;
      const newStock = previousStock + receivedItem.quantity;

      inventory.currentStock = newStock;
      inventory.lastUpdated = new Date();
      await inventory.save(session ? { session } : {});

      // 3. Create InventoryTransaction of type RECEIVE
      const transactionData = {
        inventoryId: inventory._id,
        materialId: poItem.materialId,
        projectId: purchaseOrder.projectId,
        type: TRANSACTION_TYPE.RECEIVE,
        quantity: receivedItem.quantity,
        balanceAfter: newStock,
        referenceType: REFERENCE_TYPE.PURCHASE_ORDER,
        referenceId: purchaseOrder._id,
        performedBy: userId,
        notes: `Received via PO ${purchaseOrder.poNumber}`,
      };
      
      if (session) {
        await InventoryTransaction.create([transactionData], { session });
      } else {
        await InventoryTransaction.create(transactionData);
      }
    }

    // 4. Update overall PO status
    const allReceived = purchaseOrder.items.every(
      (item) => item.receivedQuantity >= item.quantity
    );

    if (allReceived) {
      purchaseOrder.status = PO_STATUS.RECEIVED;
      purchaseOrder.actualDelivery = new Date();
    } else {
      purchaseOrder.status = PO_STATUS.PARTIALLY_RECEIVED;
    }

    await purchaseOrder.save(session ? { session } : {});

    if (useTransactions && session) {
      await session.commitTransaction();
      session.endSession();
    }

    return purchaseOrder.populate([
      { path: 'projectId', select: 'name code location' },
      { path: 'supplierId', select: 'name code contactPerson' },
      { path: 'items.materialId', select: 'name code unit category' },
      { path: 'approvedBy', select: 'name email role' },
    ]);
  } catch (error) {
    if (useTransactions && session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

export const cancelPurchaseOrder = async (id: string): Promise<IPurchaseOrder> => {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) {
    throw new AppError('Purchase order not found', 404);
  }

  // Business Rule: Only draft purchase orders can be cancelled
  if (purchaseOrder.status !== PO_STATUS.DRAFT) {
    throw new AppError(
      `Cannot cancel purchase order with status '${purchaseOrder.status}'. Only draft orders can be cancelled.`,
      400
    );
  }

  purchaseOrder.status = PO_STATUS.CANCELLED;
  await purchaseOrder.save();

  return purchaseOrder;
};
