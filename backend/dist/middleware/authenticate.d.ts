import { Request, Response, NextFunction } from 'express';
export interface JWTPayload {
    userId: string;
    role: string;
}
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authenticate.d.ts.map