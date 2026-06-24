// helpers/transaction.helper.ts
import { AppDataSource } from '../config/typeorm.config';
import { QueryRunner } from 'typeorm';

export async function withTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        const result = await operation(queryRunner);
        
        await queryRunner.commitTransaction();
        return result;
        
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}