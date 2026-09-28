export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare const parsePagination: (query: any) => PaginationParams;
export declare const calculateTotalPages: (total: number, limit: number) => number;
export declare const buildPaginationMeta: (page: number, limit: number, total: number) => PaginationMeta;
//# sourceMappingURL=pagination.d.ts.map