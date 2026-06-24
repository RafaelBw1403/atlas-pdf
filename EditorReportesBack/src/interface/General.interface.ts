

interface IGeneratePDFService {
    apiKey: string;
    documentId?: string;
    documentGroupId?: string;
    stage?: string;
    webhookUrl?: string;
    webhookMethod?: 'POST' | 'PUT';
    expiresInMinutes?: number;
    quotaInfo?: {
        used: number;
        limit: number;
        overageUsed: number;
        overageCost?: number | undefined;
    }
}