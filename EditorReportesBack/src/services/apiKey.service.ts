import { ApiKey } from "../entities/ApiKey.entity";
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from "../config/typeorm.config";
import { ApiKeyValidationResult } from "../types/quota.types";
import { withTransaction } from "../helpers/transaction.helper";
import { QueryRunner } from "typeorm";
import { createDevelopmentApiKey, createProductionApiKey } from "../helpers/api-key.helper";

export class ApiKeyService {

    private static apiKeyRepository = AppDataSource.getRepository(ApiKey);


    public static async createApiDevelopmentKey(userId: string) {
        // return await this.createApiKey({
        //     userId,
        //     type: 'development',
        //     rate_limit: 10000,
        //     rate_limit_per_day: 10000
        // });
        return withTransaction(async (queryRunner: QueryRunner) => {
            return await createDevelopmentApiKey(queryRunner, userId);
        });
    }

    public static async createApiProductionKey(userId: string) {
        // return await this.createApiKey({
        //     userId,
        //     type: 'production',
        //     rate_limit: 1000,
        //     rate_limit_per_day: 1000
        // });
        return withTransaction(async (queryRunner: QueryRunner) => {
            return await createProductionApiKey(queryRunner, userId);
        });
    }

    static async deleteLogicalApiKey(apiKey: ApiKey) {
        apiKey.isActive = false;
        await this.apiKeyRepository.save(apiKey);
    }

    static async updateApiKey(apiKey: ApiKey) {
        await this.apiKeyRepository.save(apiKey);
    }

    // static async validateApiKey(apiKey: string) {
    //     const apiKeyEntity = await this.apiKeyRepository.findOneBy({ api_key: apiKey });
    //     if (apiKeyEntity?.isActive === false || apiKeyEntity?.isActive === null) {
    //         throw new Error('Invalid API key');
    //     }
    //     return apiKeyEntity;
    // }

    static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
        const apiKeyRepository = AppDataSource.getRepository(ApiKey);
        
        // Agregar 'relations: ['user']' a la consulta existente
        const apiKeyEntity = await apiKeyRepository.findOne({
            where: { 
                api_key: apiKey,
                isActive: true 
            },
            relations: ['user']  // ← ESTO es lo nuevo
        });

        if (!apiKeyEntity) {
            return {
                valid: false,
                type: 'development',
                user: null,           // ← nuevo
                apiKeyEntity: null,   // ← nuevo
                message: 'Invalid API key'
            };
        }

        // Actualizar último uso (si no existe, agrega esto)
        apiKeyEntity.lastRequestAt = new Date();
        apiKeyEntity.totalRequests = Number(apiKeyEntity.totalRequests) + 1;
        await apiKeyRepository.save(apiKeyEntity);

        return {
            valid: true,
            type: apiKeyEntity.type,
            user: apiKeyEntity.user,           // ← nuevo
            apiKeyEntity: apiKeyEntity         // ← nuevo
        };
    }

    static async getApiKeys() {
        return await this.apiKeyRepository.find();
    }

    static async getApiKeyById(id: string) {
        return await this.apiKeyRepository.findOneBy({ id });
    }

    static async getApiKeyByApiKey(apiKey: string) {
        return await this.apiKeyRepository.findOneBy({ api_key: apiKey });
    }

    static async getActiveApiKeysByUserId(userId: string) {
        const apukeys = await this.apiKeyRepository.find({ 
            where: { 
                user: { id: userId },
                isActive: true
            }
        });
        return apukeys;
    }

    static async getApiKeyActiveByType(type: 'development' | 'production') {
        return await this.apiKeyRepository.find({ where: { type, isActive: true } });
    }

    static async renewApiKey(apiKey: string, userId: string) {

        const existingApiKey = await this.getApiKeyByApiKey(apiKey);
        if (!existingApiKey) {
            throw new Error('API key not found');
        }
        await this.deleteLogicalApiKey(existingApiKey);

        if (existingApiKey.type === 'development') {
            return await this.createApiDevelopmentKey(userId);
        }

        if (existingApiKey.type === 'production') {
            return await this.createApiProductionKey(userId);
        }
        return null;
    }

    static async createApiKey(apiKeyData: {
        userId: string;
        type: 'development' | 'production';
        rate_limit: number;
        rate_limit_per_day: number;
    }) {

        const { userId, type, rate_limit, rate_limit_per_day } = apiKeyData;

        const apiKeyCode = uuidv4();

        const apiKey = this.apiKeyRepository.create({
            api_key: apiKeyCode,
            user: { id: userId },
            type,
            rate_limit,
            rateLimitPerDay: rate_limit_per_day
        });
        await this.apiKeyRepository.save(apiKey);
        return apiKey;
    }

}   