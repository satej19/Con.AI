import Inventory, { IInventory } from '../models/Inventory.model';
import InventoryTransaction from '../models/InventoryTransaction.model';
import Material from '../models/Material.model';
import Project from '../models/Project.model';
import { AppError } from '../utils/AppError';
import type { IssueMaterialInput, ReturnMaterialInput } from '../validators/inventory.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import mongoose from 'mongoose';

export const getAllInventory = async (query: any): Promise<{ inventory: IInventory[]; meta: any }> => {
  const { page, limit, skip } = parsePagination(query);
  const { projectId, lowStock } = query;

  const filter: any = {};
  if (projectId) {
    filter.projectId = projectId;
  }

  let inventoryQuery = Inventory.find(filter)
    .populate('materialId', 'name code unit category reorderLevel')
    .populate('projectId', 'name code')
    .sort({ lastUpdated: -1 })
    .skip(skip)
    .limit(limit);

  let inventory = await inventoryQuery;

  if (lowStock === 'true') {
    inventory = inventory.filter(item => {
      const material = item.materialId as any;
      return material && item.currentStock <= material.reorderLevel;
    });
  }

  const total = await Inventory.countDocuments(filter);
  const meta = buildPaginationMeta(page, limit, total);

  return { inventory, meta };
};

export const getInventoryById = async (id: string): Promise<IInventory> => {
  const inventory = await Inventory.findById(id)
    .populate('materialId', 'name code unit category reorderLevel')
    .populate('projectId', 'name code');
  
  if (!inventory) {
    throw new AppError('Inventory not found', 404);
  }
  return inventory;
};

export const issueMaterial = async (input: IssueMaterialInput, userId: string): Promise<IInventory> => {
  const useTransactions = process.env['NODE_ENV'] === 'production';
  let session = null;
  
  if (useTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    const material = await Material.findById(input.materialId).session(session);
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    const project = await Project.findById(input.projectId).session(session);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    let inventory = await Inventory.findOne({
      materialId: input.materialId,
      projectId: input.projectId,
    }).session(session);

    if (!inventory) {
      throw new AppError(
        'No stock found for this material on this project. Receive goods via a Purchase Order first before issuing.',
        404
      );
    }

    if (inventory.currentStock < input.quantity) {
      throw new AppError('Insufficient stock', 400);
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
      await InventoryTransaction.create([transactionData], { session });
    } else {
      await InventoryTransaction.create(transactionData);
    }

    if (useTransactions && session) {
      await session.commitTransaction();
      session.endSession();
    }

    const updatedInventory = await Inventory.findById(inventory._id)
      .populate('materialId', 'name code unit category')
      .populate('projectId', 'name code');

    return updatedInventory as IInventory;
  } catch (error) {
    if (useTransactions && session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

export const returnMaterial = async (input: ReturnMaterialInput, userId: string): Promise<IInventory> => {
  const useTransactions = process.env['NODE_ENV'] === 'production';
  let session = null;
  
  if (useTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    const material = await Material.findById(input.materialId).session(session);
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    const project = await Project.findById(input.projectId).session(session);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    let inventory = await Inventory.findOne({
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
        const createdInventory = await Inventory.create([inventoryData], { session });
        inventory = createdInventory[0] as any;
      } else {
        inventory = await Inventory.create(inventoryData);
      }
    }

    if (!inventory) {
      throw new AppError('Failed to create inventory record', 500);
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
      await InventoryTransaction.create([transactionData], { session });
    } else {
      await InventoryTransaction.create(transactionData);
    }

    if (useTransactions && session) {
      await session.commitTransaction();
      session.endSession();
    }

    const updatedInventory = await Inventory.findById(inventory._id)
      .populate('materialId', 'name code unit category')
      .populate('projectId', 'name code');

    return updatedInventory as IInventory;
  } catch (error) {
    if (useTransactions && session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

export const receiveMaterial = async (
  materialId: string,
  projectId: string,
  quantity: number,
  referenceId: string,
  userId: string
): Promise<IInventory> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let inventory = await Inventory.findOne({
      materialId,
      projectId,
    }).session(session);

    if (!inventory) {
      const createdInventory = await Inventory.create([{
        materialId,
        projectId,
        currentStock: 0,
        lastUpdated: new Date(),
      }], { session });
      inventory = createdInventory[0] as any;
    }

    if (!inventory) {
      throw new AppError('Failed to create inventory record', 500);
    }

    inventory.currentStock += quantity;
    inventory.lastUpdated = new Date();
    await inventory.save({ session });

    await InventoryTransaction.create([{
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

    const updatedInventory = await Inventory.findById(inventory._id)
      .populate('materialId', 'name code unit category')
      .populate('projectId', 'name code');

    return updatedInventory as IInventory;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getTransactions = async (query: any): Promise<{ transactions: any[]; meta: any }> => {
  const { page, limit, skip } = parsePagination(query);
  const { projectId, materialId, type, startDate, endDate } = query;

  const filter: any = {};
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

  const transactions = await InventoryTransaction.find(filter)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code')
    .populate('performedBy', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await InventoryTransaction.countDocuments(filter);
  const meta = buildPaginationMeta(page, limit, total);

  return { transactions, meta };
};
