import Supplier, { ISupplier } from '../models/Supplier.model';
import Material from '../models/Material.model';
import { AppError } from '../utils/AppError';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQueryInput,
} from '../validators/supplier.validator';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../utils/pagination';

export const createSupplier = async (input: CreateSupplierInput): Promise<ISupplier> => {
  const existingSupplier = await Supplier.findOne({ code: input.code });
  if (existingSupplier) {
    throw new AppError(`Supplier with code '${input.code}' already exists`, 409);
  }

  if (input.materialsSupplied && input.materialsSupplied.length > 0) {
    const uniqueMaterialIds = Array.from(new Set(input.materialsSupplied));
    const materialCount = await Material.countDocuments({ _id: { $in: uniqueMaterialIds } });
    if (materialCount !== uniqueMaterialIds.length) {
      throw new AppError('One or more material IDs in materialsSupplied do not exist', 400);
    }
  }

  const supplier = new Supplier({
    name: input.name,
    code: input.code,
    contactPerson: input.contactPerson,
    email: input.email,
    phone: input.phone,
    address: input.address,
    gstNumber: input.gstNumber,
    materialsSupplied: input.materialsSupplied ? Array.from(new Set(input.materialsSupplied)) : [],
    rating: input.rating,
  });

  await supplier.save();
  await supplier.populate('materialsSupplied', 'name code category unit');
  return supplier;
};

export const getAllSuppliers = async (
  query: SupplierQueryInput
): Promise<{ suppliers: ISupplier[]; meta: PaginationMeta }> => {
  const { page, limit, skip } = parsePagination(query);
  const { materialId, isActive, search } = query;

  const filter: Record<string, any> = {};
  if (materialId) {
    filter['materialsSupplied'] = materialId;
  }
  if (isActive !== undefined) {
    filter['isActive'] = isActive;
  }
  if (search) {
    filter['name'] = { $regex: search, $options: 'i' };
  }

  const [suppliers, total] = await Promise.all([
    Supplier.find(filter)
      .populate('materialsSupplied', 'name code category unit')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Supplier.countDocuments(filter),
  ]);

  const meta = buildPaginationMeta(page, limit, total);
  return { suppliers, meta };
};

export const getSupplierById = async (id: string): Promise<ISupplier> => {
  const supplier = await Supplier.findById(id).populate(
    'materialsSupplied',
    'name code category unit'
  );
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  return supplier;
};

export const updateSupplier = async (
  id: string,
  input: UpdateSupplierInput
): Promise<ISupplier> => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  if (input.materialsSupplied && input.materialsSupplied.length > 0) {
    const uniqueMaterialIds = Array.from(new Set(input.materialsSupplied));
    const materialCount = await Material.countDocuments({ _id: { $in: uniqueMaterialIds } });
    if (materialCount !== uniqueMaterialIds.length) {
      throw new AppError('One or more material IDs in materialsSupplied do not exist', 400);
    }
    supplier.materialsSupplied = uniqueMaterialIds as any;
  } else if (input.materialsSupplied !== undefined) {
    supplier.materialsSupplied = [];
  }

  if (input.name !== undefined) supplier.name = input.name;
  if (input.contactPerson !== undefined) supplier.contactPerson = input.contactPerson;
  if (input.email !== undefined) supplier.email = input.email;
  if (input.phone !== undefined) supplier.phone = input.phone;
  if (input.address !== undefined) supplier.address = input.address;
  if (input.gstNumber !== undefined) supplier.gstNumber = input.gstNumber;
  if (input.rating !== undefined) supplier.rating = input.rating;
  if (input.isActive !== undefined) supplier.isActive = input.isActive;

  await supplier.save();
  await supplier.populate('materialsSupplied', 'name code category unit');
  return supplier;
};
