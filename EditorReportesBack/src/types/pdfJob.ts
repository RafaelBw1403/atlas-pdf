

export type PDFJobData = {
  apiKey: string;
  documentId?: string;
  documentGroupId?: string;
  stage?: string;
  deleteImmediately: boolean;
  webhookUrl?: string;
  data?: Record<string, any>;
  expiresInMinutes?: number;
};