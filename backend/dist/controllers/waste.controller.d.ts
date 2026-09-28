import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const create: (req: AuthRequest, res: Response) => Promise<void>;
export declare const list: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getById: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=waste.controller.d.ts.map