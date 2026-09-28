import { IMaterial } from '../models/Material.model';
import type { CreateMaterialInput, UpdateMaterialInput, MaterialQueryInput } from '../validators/material.validator';
import { PaginationMeta } from '../utils/pagination';
export declare const createMaterial: (input: CreateMaterialInput) => Promise<IMaterial>;
export declare const getAllMaterials: (query: MaterialQueryInput) => Promise<{
    materials: IMaterial[];
    meta: PaginationMeta;
}>;
export declare const getMaterialById: (id: string) => Promise<IMaterial>;
export declare const updateMaterial: (id: string, input: UpdateMaterialInput) => Promise<IMaterial>;
//# sourceMappingURL=material.service.d.ts.map