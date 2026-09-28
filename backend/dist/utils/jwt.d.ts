export interface JWTPayload {
    userId: string;
    role: string;
}
export declare const signToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
//# sourceMappingURL=jwt.d.ts.map