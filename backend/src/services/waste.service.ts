import WasteRecord, { IWasteRecord } from '../models/WasteRecord.model';
import Material from '../models/Material.model';
import Project from '../models/Project.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import type { CreateWasteInput } from '../validators/waste.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';

const calculateAverageUnitPrice = async (materialId: string): Promise<number> => {
  // Cast to ObjectId for reliable subdocument matching
  const materialObjectId = new mongoose.Types.ObjectId(materialId);

  const purchaseOrders = await PurchaseOrder.find({
    'items.materialId': materialObjectId,
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

export const createWasteRecord = async (input: CreateWasteInput, userId: string): Promise<IWasteRecord> => {
  const material = await Material.findById(input.materialId);
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  const project = await Project.findById(input.projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const averageUnitPrice = await calculateAverageUnitPrice(input.materialId);
  const costImpact = input.quantity * averageUnitPrice;

  const wasteRecord = await WasteRecord.create({
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

export const getAllWasteRecords = async (query: any): Promise<{ wasteRecords: IWasteRecord[]; meta: any }> => {
  const { page, limit, skip } = parsePagination(query);
  const { projectId, materialId, reason, startDate, endDate } = query;

  const filter: any = {};
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

  const wasteRecords = await WasteRecord.find(filter)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code')
    .populate('reportedBy', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await WasteRecord.countDocuments(filter);
  const meta = buildPaginationMeta(page, limit, total);

  return { wasteRecords, meta };
};

export const getWasteRecordById = async (id: string): Promise<IWasteRecord> => {
  const wasteRecord = await WasteRecord.findById(id)
    .populate('materialId', 'name code unit')
    .populate('projectId', 'name code')
    .populate('reportedBy', 'name');
  
  if (!wasteRecord) {
    throw new AppError('Waste record not found', 404);
  }
  return wasteRecord;
};

// Recalculates costImpact for all records where it was stored as 0
// (happens when waste was logged before any PO was received)
export const recalculateWasteCosts = async (): Promise<{ updated: number }> => {
  const zeroCostRecords = await WasteRecord.find({ costImpact: 0 });
  let updated = 0;

  for (const record of zeroCostRecords) {
    const avgPrice = await calculateAverageUnitPrice(record.materialId.toString());
    if (avgPrice > 0) {
      record.costImpact = record.quantity * avgPrice;
      await record.save();
      updated++;
    }
  }

  return { updated };
};
