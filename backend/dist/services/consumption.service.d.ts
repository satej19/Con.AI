import { IConsumptionPlan } from '../models/ConsumptionPlan.model';
import type { CreateConsumptionPlanInput, UpdateConsumptionPlanInput } from '../validators/consumption.validator';
export declare const createConsumptionPlan: (input: CreateConsumptionPlanInput, userId: string) => Promise<IConsumptionPlan>;
export declare const getAllConsumptionPlans: (query: any) => Promise<{
    consumptionPlans: IConsumptionPlan[];
    meta: any;
}>;
export declare const getConsumptionPlanById: (id: string) => Promise<IConsumptionPlan>;
export declare const updateConsumptionPlan: (id: string, input: UpdateConsumptionPlanInput) => Promise<IConsumptionPlan>;
export declare const getVarianceAnalysis: (id: string) => Promise<any>;
export declare const getVarianceReport: (projectId: string, period: string) => Promise<any>;
export declare const syncActuals: (id: string) => Promise<any>;
//# sourceMappingURL=consumption.service.d.ts.map