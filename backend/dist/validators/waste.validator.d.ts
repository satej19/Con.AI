import { z } from 'zod';
export declare const createWasteSchema: z.ZodObject<{
    materialId: z.ZodString;
    projectId: z.ZodString;
    quantity: z.ZodNumber;
    reason: z.ZodEnum<{
        damaged: "damaged";
        defective: "defective";
        expired: "expired";
        natural_loss: "natural_loss";
        other: "other";
        overuse: "overuse";
        spillage: "spillage";
    }>;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateWasteInput = z.infer<typeof createWasteSchema>;
//# sourceMappingURL=waste.validator.d.ts.map