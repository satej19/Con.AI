import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const list: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const issue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const returnMaterial: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listTransactions: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=inventory.controller.d.ts.map