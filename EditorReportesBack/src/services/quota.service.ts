import { QueryRunner } from 'typeorm';
import { ApiKey } from '../entities/ApiKey.entity';
import { withTransaction } from '../helpers/transaction.helper';
import { SubscriptionService } from './subscriptions.service';
import { UsageCounterService } from './usage-counter.service';

export interface QuotaCheckResult {
    allowed: boolean;
    currentUsage: number;
    limit: number;
    overageUsage: number;
    overageCost?: number;
    featureCode: string;
    isOverage: boolean;
}

export class QuotaService {
    /**
     * Verifica si el usuario puede generar un PDF y actualiza el contador
     */
    static async checkAndIncrementPDFQuota(
        apiKey: ApiKey,
        documentId: string,
        queryRunner?: QueryRunner
    ): Promise<QuotaCheckResult> {
        // Determinamos el feature según el tipo de API key
        const featureCode = apiKey.type === 'production' 
            ? 'doc_limit_prod' 
            : 'doc_limit_dev';

        // [DISABLED] Subscription and usage-counter checks - always allow
        return {
            allowed: true,
            currentUsage: 0,
            limit: 999999,
            overageUsage: 0,
            featureCode,
            isOverage: false
        };
    }

    /**
     * Versión que maneja su propia transacción
     */
    static async checkAndIncrementPDFQuotaTransaction(
        apiKey: ApiKey,
        documentId: string
    ): Promise<QuotaCheckResult> {
        return withTransaction(async (queryRunner) => {
            return this.checkAndIncrementPDFQuota(apiKey, documentId, queryRunner);
        });
    }
}