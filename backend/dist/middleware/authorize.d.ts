import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
export declare const authorize: (...allowedRoles: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requireManager: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requireStoreKeeper: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requirePlanner: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const requireWasteReporter: (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map