import { IInventory } from '../models/Inventory.model';
import type { IssueMaterialInput, ReturnMaterialInput } from '../validators/inventory.validator';
export declare const getAllInventory: (query: any) => Promise<{
    inventory: IInventory[];
    meta: any;
}>;
export declare const getInventoryById: (id: string) => Promise<IInventory>;
export declare const issueMaterial: (input: IssueMaterialInput, userId: string) => Promise<IInventory>;
export declare const returnMaterial: (input: ReturnMaterialInput, userId: string) => Promise<IInventory>;
export declare const receiveMaterial: (materialId: string, projectId: string, quantity: number, referenceId: string, userId: string) => Promise<IInventory>;
export declare const getTransactions: (query: any) => Promise<{
    transactions: any[];
    meta: any;
}>;
//# sourceMappingURL=inventory.service.d.ts.map