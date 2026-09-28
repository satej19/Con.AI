import { Response } from 'express';
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class ApiResponse {
    static success<T>(res: Response, statusCode?: number, message?: string, data?: T, meta?: PaginationMeta): void;
    static error(res: Response, statusCode?: number, message?: string, errors?: Array<{
        field: string;
        message: string;
    }>): void;
}
export {};
//# sourceMappingURL=ApiResponse.d.ts.map