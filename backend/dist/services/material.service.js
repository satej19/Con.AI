"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaterial = exports.getMaterialById = exports.getAllMaterials = exports.createMaterial = void 0;
const Material_model_1 = __importDefault(require("../models/Material.model"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const createMaterial = async (input) => {
    const existingMaterial = await Material_model_1.default.findOne({ code: input.code });
    if (existingMaterial) {
        throw new AppError_1.AppError(`Material with code '${input.code}' already exists`, 409);
    }
    const material = new Material_model_1.default({
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
exports.createMaterial = createMaterial;
const getAllMaterials = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const { category, search, isActive } = query;
    const filter = {};
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
        Material_model_1.default.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit),
        Material_model_1.default.countDocuments(filter),
    ]);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { materials, meta };
};
exports.getAllMaterials = getAllMaterials;
const getMaterialById = async (id) => {
    const material = await Material_model_1.default.findById(id);
    if (!material) {
        throw new AppError_1.AppError('Material not found', 404);
    }
    return material;
};
exports.getMaterialById = getMaterialById;
const updateMaterial = async (id, input) => {
    const material = await Material_model_1.default.findById(id);
    if (!material) {
        throw new AppError_1.AppError('Material not found', 404);
    }
    if (input.name !== undefined) {
        material.name = input.name;
    }
    if (input.category !== undefined) {
        material.category = input.category;
    }
    if (input.unit !== undefined) {
        material.unit = input.unit;
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
exports.updateMaterial = updateMaterial;
//# sourceMappingURL=material.service.js.map