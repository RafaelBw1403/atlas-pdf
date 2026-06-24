// helpers/api-key.helper.ts
import { v4 as uuidv4 } from 'uuid';
import { ApiKey } from '../entities/ApiKey.entity';
import { QueryRunner } from 'typeorm';

export async function createDevelopmentApiKey(
    queryRunner: QueryRunner, 
    userId: string
) {
    const devApiKey = queryRunner.manager.create(ApiKey, {
        api_key: uuidv4(),
        user: { id: userId },
        type: 'development',
        rate_limit: 10000,
        rateLimitPerDay: 10000,
        isActive: true
    });
    return await queryRunner.manager.save(devApiKey);
}

export async function createProductionApiKey(
    queryRunner: QueryRunner, 
    userId: string
) {
    const prodApiKey = queryRunner.manager.create(ApiKey, {
        api_key: uuidv4(),
        user: { id: userId },
        type: 'production',
        rate_limit: 1000,
        rateLimitPerDay: 1000,
        isActive: true
    });
    return await queryRunner.manager.save(prodApiKey);
}

// Opcional: función que crea ambas si las necesitas juntas
export async function createDefaultApiKeys(
    queryRunner: QueryRunner, 
    userId: string
) {
    const devKey = await createDevelopmentApiKey(queryRunner, userId);
    const prodKey = await createProductionApiKey(queryRunner, userId);
    return { devKey, prodKey };
}