import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { UsageCounter } from '../entities/UsageCounter.entity';
import { User } from '../entities/User.entity';

export class UsageCounterService {
    /**
     * Obtiene o crea un contador de uso para un usuario y feature
     */
    static async getOrCreateCounter(
        userId: string,
        featureCode: string,
        periodStart: Date,
        periodEnd: Date,
        queryRunner?: QueryRunner
    ): Promise<UsageCounter> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(UsageCounter)
            : AppDataSource.getRepository(UsageCounter);

        // Buscar contador existente
        let counter = await repository.findOne({
            where: {
                user: { id: userId },
                featureCode: featureCode
            },
            relations: ['user']
        });

        const now = new Date();

        // Si no existe, crear uno nuevo
        if (!counter) {
            const userRepository = queryRunner
                ? queryRunner.manager.getRepository(User)
                : AppDataSource.getRepository(User);

            const user = await userRepository.findOneBy({ id: userId });
            
            if (!user) {
                throw new Error('User not found');
            }

            counter = repository.create({
                user,
                featureCode,
                current_usage: 0,
                overage_usage: 0,
                last_reset: now
            });

            counter = await repository.save(counter);
            return counter;
        }

        // Verificar si necesita reset (cambio de período)
        if (now > periodEnd || counter.last_reset < periodStart) {
            // Resetear contadores
            counter.current_usage = 0;
            // NOTA: overage_usage NO se resetea porque es acumulativo para facturación
            counter.last_reset = now;
            counter = await repository.save(counter);
        }

        return counter;
    }

    /**
     * Incrementa el contador de uso
     */
    static async incrementUsage(
        userId: string,
        featureCode: string,
        isOverage: boolean,
        queryRunner?: QueryRunner
    ): Promise<UsageCounter> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(UsageCounter)
            : AppDataSource.getRepository(UsageCounter);

        const counter = await repository.findOne({
            where: {
                user: { id: userId },
                featureCode: featureCode
            }
        });

        if (!counter) {
            throw new Error('Usage counter not found');
        }

        if (isOverage) {
            counter.overage_usage += 1;
        } else {
            counter.current_usage += 1;
        }

        return await repository.save(counter);
    }

    /**
     * Obtiene el uso actual para un usuario y feature
     */
    static async getCurrentUsage(
        userId: string,
        featureCode: string
    ): Promise<{ current: number; overage: number }> {
        const repository = AppDataSource.getRepository(UsageCounter);
        
        const counter = await repository.findOne({
            where: {
                user: { id: userId },
                featureCode: featureCode
            }
        });

        if (!counter) {
            return { current: 0, overage: 0 };
        }

        return {
            current: counter.current_usage,
            overage: counter.overage_usage
        };
    }

    /**
     * Resetea manualmente un contador (útil para cambios de plan)
     */
    static async resetCounter(
        userId: string,
        featureCode: string,
        queryRunner?: QueryRunner
    ): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(UsageCounter)
            : AppDataSource.getRepository(UsageCounter);

        await repository.update(
            {
                user: { id: userId },
                featureCode: featureCode
            },
            {
                current_usage: 0,
                last_reset: new Date()
            }
        );
    }
}