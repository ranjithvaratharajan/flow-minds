export interface GenerateResponse {
    success: boolean;
    data: {
        mermaid: string;
    };
}

export interface GenerateRequest {
    prompt: string;
}
