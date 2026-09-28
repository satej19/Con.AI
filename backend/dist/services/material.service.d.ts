import { IMaterial } from '../models/Material.model';
import type { CreateMaterialInput, UpdateMaterialInput } from '../validators/material.validator';
export declare const createMaterial: (input: CreateMaterialInput) => Promise<IMaterial>;
export declare const getAllMaterials: (query: any) => Promise<{
    materials: IMaterial[];
    meta: any;
}>;
export declare const getMaterialById: (id: string) => Promise<IMaterial>;
export declare const updateMaterial: (id: string, input: UpdateMaterialInput) => Promise<IMaterial>;
//# sourceMappingURL=material.service.d.ts.map