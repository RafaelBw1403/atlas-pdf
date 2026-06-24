import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Subscription } from '../entities/Subscription.entity';
import { Plan } from '../entities/Plan.entity';
import { Feature } from '../entities/Feature.entity';
import { PlanEntitlement } from '../entities/PlanEntitlement.entity';

export interface ActiveSubscription {
    plan: Plan;
    entitlements: Map<string, PlanEntitlement>;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}

export class SubscriptionService {
    /**
     * Obtiene la suscripción activa de un usuario
     */
    static async getActiveSubscription(
        userId: string,
        queryRunner?: QueryRunner
    ): Promise<ActiveSubscription | null> {
        const repository = queryRunner 
            ? queryRunner.manager.getRepository(Subscription)
            : AppDataSource.getRepository(Subscription);

        const subscription = await repository.findOne({
            where: {
                user: { id: userId },
                status: 'active'
            },
            relations: {
                plan: {
                    entitlements: {
                        feature: true
                    }
                }
            },
            order: {
                current_period_end: 'DESC'
            }
        });

        if (!subscription) {
            return null;
        }

        // Verificar si la suscripción está dentro del período vigente
        const now = new Date();
        if (now > subscription.current_period_end) {
            // Suscripción expirada
            return null;
        }

        // Crear un Map para acceso rápido a entitlements
        const entitlements = new Map();
        if (subscription.plan.entitlements) {
            subscription.plan.entitlements.forEach(ent => {
                entitlements.set(ent.feature.code, ent);
            });
        }

        return {
            plan: subscription.plan,
            entitlements,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end
        };
    }

    /**
     * Obtiene el valor de un feature específico del plan
     */
    static async getFeatureValue(
        plan: Plan | undefined,
        featureCode: string,
        defaultValue: any = 0
    ): Promise<any> {
        if (!plan || !plan.entitlements) {
            return defaultValue;
        }

        const entitlement = plan.entitlements.find(
            e => e.feature.code === featureCode
        );

        if (!entitlement) {
            return defaultValue;
        }

        // Convertir según el tipo de dato del feature
        switch (entitlement.feature.data_type) {
            case 'int':
                return parseInt(entitlement.value, 10);
            case 'float':
                return parseFloat(entitlement.value);
            case 'bool':
                return entitlement.value.toLowerCase() === 'true';
            default:
                return entitlement.value;
        }
    }

    /**
     * Verifica si un usuario tiene acceso a una funcionalidad
     */
    static async hasFeature(
        userId: string,
        featureCode: string,
        queryRunner?: QueryRunner
    ): Promise<boolean> {
        const subscription = await this.getActiveSubscription(userId, queryRunner);
        
        if (!subscription) {
            return false;
        }

        const entitlement = subscription.entitlements.get(featureCode);
        
        if (!entitlement) {
            return false;
        }

        // Para features booleanos, verificamos que sea true
        if (entitlement.feature.data_type === 'bool') {
            return entitlement.value.toLowerCase() === 'true';
        }

        // Para features numéricos, verificamos que sea > 0 o -1 (ilimitado)
        const value = parseInt(entitlement.value, 10);
        return value > 0 || value === -1;
    }
}