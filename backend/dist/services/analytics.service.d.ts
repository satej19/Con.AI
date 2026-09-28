interface ABCClassifiedItem {
    materialId: string;
    materialName: string;
    annualConsumptionValue: number;
    percentage: number;
    classification: 'A' | 'B' | 'C';
}
interface SDEClassifiedItem {
    materialId: string;
    materialName: string;
    scarcity: 'scarce' | 'available';
    difficulty: 'difficult' | 'easy';
    classification: 'SD' | 'SN' | 'SE' | 'DN' | 'DE' | 'NE';
}
interface EOQResult {
    materialId: string;
    materialName: string;
    annualDemand: number;
    orderingCost: number;
    holdingCost: number;
    eoq: number;
    totalCost: number;
}
export declare const getCostAnalysis: (projectId: string, startDate?: string, endDate?: string) => Promise<any>;
export declare const getABCClassification: (projectId: string) => Promise<ABCClassifiedItem[]>;
export declare const getSDEClassification: (_projectId: string) => Promise<SDEClassifiedItem[]>;
export declare const getEOQAnalysis: (projectId: string) => Promise<EOQResult[]>;
export {};
//# sourceMappingURL=analytics.service.d.ts.map