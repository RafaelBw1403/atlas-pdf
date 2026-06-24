// src/routes/pdf/types.ts
export interface GeneratePDFRequest {
  // apiKey: string;
  documentId: string;
  data: Record<string, any>; // JSON dinámico
  options?: {
    format?: 'A4' | 'Letter';
    quality?: 'low' | 'medium' | 'high';
    download?: boolean;
  };
}

export interface GeneratePDFByGroupRequest {
  apiKey: string;
  id: string;
  stage: 'draft' | 'qa' | 'production' | 'historical';
  data: Record<string, any>;
}

export interface GeneratePDFWebhookByGroupRequest {
  apiKey: string;
  idGroup: string;
  stage: 'draft' | 'qa' | 'production' | 'historical';
  webhookUrl: string;
  data?: Record<string, any>;
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfUrl?: string | undefined;
  pdfBase64?: string | undefined; // Base64 si prefieres
  documentId?: string;
  timestamp: string;
  message?: string | undefined;
  error?: string | undefined;
}

export interface ApiKeyInfo {
  key: string;
  environment: 'development' | 'production';
  clientName?: string;
  rateLimit?: number;
  isValid: boolean;
}