import { ISupplier } from '../models/Supplier.model';
import type { CreateSupplierInput, UpdateSupplierInput, SupplierQueryInput } from '../validators/supplier.validator';
import { PaginationMeta } from '../utils/pagination';
export declare const createSupplier: (input: CreateSupplierInput) => Promise<ISupplier>;
export declare const getAllSuppliers: (query: SupplierQueryInput) => Promise<{
    suppliers: ISupplier[];
    meta: PaginationMeta;
}>;
export declare const getSupplierById: (id: string) => Promise<ISupplier>;
export declare const updateSupplier: (id: string, input: UpdateSupplierInput) => Promise<ISupplier>;
//# sourceMappingURL=supplier.service.d.ts.map