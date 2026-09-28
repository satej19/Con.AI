import Material, { IMaterial } from '../models/Material.model';
import { AppError } from '../utils/AppError';
import type {
  CreateMaterialInput,
  UpdateMaterialInput,
  MaterialQueryInput,
} from '../validators/material.validator';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../utils/pagination';

export const createMaterial = async (input: CreateMaterialInput): Promise<IMaterial> => {
  const existingMaterial = await Material.findOne({ code: input.code });
  if (existingMaterial) {
    throw new AppError(`Material with code '${input.code}' already exists`, 409);
  }

  const material = new Material({
    name: input.name,
    code: input.code,
    category: input.category,
    unit: input.unit,
    description: input.description,
    hsnCode: input.hsnCode,
    reorderLevel: input.reorderLevel,
  });

  await material.save();
  return material;
};

export const getAllMaterials = async (
  query: MaterialQueryInput
): Promise<{ materials: IMaterial[]; meta: PaginationMeta }> => {
  const { page, limit, skip } = parsePagination(query);
  const { category, search, isActive } = query;

  const filter: Record<string, any> = {};
  if (category) {
    filter['category'] = category;
  }
  if (isActive !== undefined) {
    filter['isActive'] = isActive;
  }
  if (search) {
    filter['$text'] = { $search: search };
  }

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Material.countDocuments(filter),
  ]);

  const meta = buildPaginationMeta(page, limit, total);
  return { materials, meta };
};

export const getMaterialById = async (id: string): Promise<IMaterial> => {
  const material = await Material.findById(id);
  if (!material) {
    throw new AppError('Material not found', 404);
  }
  return material;
};

export const updateMaterial = async (
  id: string,
  input: UpdateMaterialInput
): Promise<IMaterial> => {
  const material = await Material.findById(id);
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  if (input.name !== undefined) {
    material.name = input.name;
  }
  if (input.category !== undefined) {
    material.category = input.category as any;
  }
  if (input.unit !== undefined) {
    material.unit = input.unit as any;
  }
  if (input.description !== undefined) {
    material.description = input.description || undefined;
  }
  if (input.hsnCode !== undefined) {
    material.hsnCode = input.hsnCode || undefined;
  }
  if (input.reorderLevel !== undefined) {
    material.reorderLevel = input.reorderLevel;
  }
  if (input.isActive !== undefined) {
    material.isActive = input.isActive;
  }

  await material.save();
  return material;
};
