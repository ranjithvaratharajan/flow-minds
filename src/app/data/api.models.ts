export interface GenerateResponse {
    success: boolean;
    data: {
        mermaid: string;
    };
}

export interface GenerateRequest {
    prompt: string;
}

export interface QuotaResponse {
    remaining: number;
    limit: number;
    resetAt: string; // ISO Date string
}
