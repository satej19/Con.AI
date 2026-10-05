export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
export interface AiResponse {
    message: string;
    action?: ActionResult;
}
export interface ActionResult {
    type: 'project_created' | 'plan_created' | 'none';
    data?: any;
}
export declare const processChat: (messages: ChatMessage[], userId: string) => Promise<AiResponse>;
//# sourceMappingURL=ai.service.d.ts.map