import { User } from '../entities/User.entity';
import { ApiKey } from '../entities/ApiKey.entity';

export interface QuotaCheckResult {
    allowed: boolean;
    currentUsage: number;
    limit: number;
    overageUsage: number;
    overageCost?: number;
    featureCode: string;
    isOverage: boolean;
}

export interface QuotaInfo {
    used: number;
    limit: number;
    overageUsed: number;
    overageCost?: number;
}

export interface PDFGenerationQuota {
    quotaInfo: QuotaInfo;
    featureCode: string;
    planName: string;
}

// Extendemos el resultado de validación de API key
export interface ApiKeyValidationResult {
    valid: boolean;
    type: 'development' | 'production';
    user: User | null;
    apiKeyEntity: ApiKey | null;
    message?: string;
}

// Extendemos el payload de generación de PDF
export interface IGeneratePDFServiceWithQuota {
    apiKey: string;
    documentId: string;
    user?: User;
    apiKeyEntity?: ApiKey;
    quotaInfo?: QuotaInfo; // Se llena después de verificar quota
}