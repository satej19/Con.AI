import { IWasteRecord } from '../models/WasteRecord.model';
import type { CreateWasteInput } from '../validators/waste.validator';
export declare const createWasteRecord: (input: CreateWasteInput, userId: string) => Promise<IWasteRecord>;
export declare const getAllWasteRecords: (query: any) => Promise<{
    wasteRecords: IWasteRecord[];
    meta: any;
}>;
export declare const getWasteRecordById: (id: string) => Promise<IWasteRecord>;
export declare const recalculateWasteCosts: () => Promise<{
    updated: number;
}>;
//# sourceMappingURL=waste.service.d.ts.map