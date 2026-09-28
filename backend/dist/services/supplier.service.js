"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplier = exports.getSupplierById = exports.getAllSuppliers = exports.createSupplier = void 0;
const Supplier_model_1 = __importDefault(require("../models/Supplier.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const createSupplier = async (input) => {
    const existingSupplier = await Supplier_model_1.default.findOne({ code: input.code });
    if (existingSupplier) {
        throw new AppError_1.AppError(`Supplier with code '${input.code}' already exists`, 409);
    }
    if (input.materialsSupplied && input.materialsSupplied.length > 0) {
        const uniqueMaterialIds = Array.from(new Set(input.materialsSupplied));
        const materialCount = await Material_model_1.default.countDocuments({ _id: { $in: uniqueMaterialIds } });
        if (materialCount !== uniqueMaterialIds.length) {
            throw new AppError_1.AppError('One or more material IDs in materialsSupplied do not exist', 400);
        }
    }
    const supplier = new Supplier_model_1.default({
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
exports.createSupplier = createSupplier;
const getAllSuppliers = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { materialId, isActive, search } = query;
    const filter = {};
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
        Supplier_model_1.default.find(filter)
            .populate('materialsSupplied', 'name code category unit')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit),
        Supplier_model_1.default.countDocuments(filter),
    ]);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { suppliers, meta };
};
exports.getAllSuppliers = getAllSuppliers;
const getSupplierById = async (id) => {
    const supplier = await Supplier_model_1.default.findById(id).populate('materialsSupplied', 'name code category unit');
    if (!supplier) {
        throw new AppError_1.AppError('Supplier not found', 404);
    }
    return supplier;
};
exports.getSupplierById = getSupplierById;
const updateSupplier = async (id, input) => {
    const supplier = await Supplier_model_1.default.findById(id);
    if (!supplier) {
        throw new AppError_1.AppError('Supplier not found', 404);
    }
    if (input.materialsSupplied && input.materialsSupplied.length > 0) {
        const uniqueMaterialIds = Array.from(new Set(input.materialsSupplied));
        const materialCount = await Material_model_1.default.countDocuments({ _id: { $in: uniqueMaterialIds } });
        if (materialCount !== uniqueMaterialIds.length) {
            throw new AppError_1.AppError('One or more material IDs in materialsSupplied do not exist', 400);
        }
        supplier.materialsSupplied = uniqueMaterialIds;
    }
    else if (input.materialsSupplied !== undefined) {
        supplier.materialsSupplied = [];
    }
    if (input.name !== undefined)
        supplier.name = input.name;
    if (input.contactPerson !== undefined)
        supplier.contactPerson = input.contactPerson;
    if (input.email !== undefined)
        supplier.email = input.email;
    if (input.phone !== undefined)
        supplier.phone = input.phone;
    if (input.address !== undefined)
        supplier.address = input.address;
    if (input.gstNumber !== undefined)
        supplier.gstNumber = input.gstNumber;
    if (input.rating !== undefined)
        supplier.rating = input.rating;
    if (input.isActive !== undefined)
        supplier.isActive = input.isActive;
    await supplier.save();
    await supplier.populate('materialsSupplied', 'name code category unit');
    return supplier;
};
exports.updateSupplier = updateSupplier;
//# sourceMappingURL=supplier.service.js.map