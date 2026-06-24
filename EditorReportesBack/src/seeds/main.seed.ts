import { DataSource } from 'typeorm';
import { Plan } from '../entities/Plan.entity';
import { Feature } from '../entities/Feature.entity';
import { PlanEntitlement } from '../entities/PlanEntitlement.entity';
import { AppDataSource } from '../config/typeorm.config';

export const seedDatabase = async (dataSource: DataSource) => {

    await dataSource.transaction(async (transactionalEntityManager) => {
        const planRepo = transactionalEntityManager.getRepository(Plan);
        const featureRepo = transactionalEntityManager.getRepository(Feature);
        const entitlementRepo = transactionalEntityManager.getRepository(PlanEntitlement);

        // 1. Definir Features
        const featuresData = [
            { code: 'doc_limit_prod', description: 'Documentos en producción (limpios)', data_type: 'int' },
            { code: 'doc_limit_dev', description: 'Documentos en dev (con marca de agua)', data_type: 'int' },
            { code: 'extra_doc_cost', description: 'Costo por PDF extra (solo Starter/Business)', data_type: 'float' },
            { code: 'template_limit', description: 'Límite de plantillas (-1 ilimitado)', data_type: 'int' },
            { code: 'max_gen_time', description: 'Max tiempo generación (seg)', data_type: 'int' },
            { code: 'retention_period', description: 'TTL del archivo (seg)', data_type: 'int' },
            { code: 'use_webhooks', description: 'Acceso a webhooks', data_type: 'bool' },
        ];

        for (const f of featuresData) {
            await featureRepo.upsert(f, ['code']);
        }

        // 2. Definir Planes (Precios Netos para que Stripe maneje el Tax)
        const plansData = [
            { name: 'Free', price: 0, currency: 'USD' },
            { name: 'Starter', price: 9.99, currency: 'USD' },
            { name: 'Pay-as-you-go', price: 20.00, currency: 'USD' },
            { name: 'Business', price: 49.99, currency: 'USD' },
        ];

        for (const p of plansData) {
            await planRepo.upsert(p, ['name']);
        }

        // 🔥 IMPORTANTE: Cargar las relaciones explícitamente
        const allPlans = await planRepo.find({
            relations: ['entitlements'] // Cargamos entitlements por si acaso
        });
        const allFeatures = await featureRepo.find({
            relations: ['entitlements'] // Cargamos entitlements por si acaso
        });
        
        const getPlan = (name: string) => allPlans.find(p => p.name === name);
        const getFeat = (code: string) => allFeatures.find(f => f.code === code);

        // 3. Mapeo de Entitlements Final
        const entitlements = [
            // --- PLAN FREE (F) ---
            { plan: getPlan('Free'), feature: getFeat('doc_limit_prod'), value: '25' },
            { plan: getPlan('Free'), feature: getFeat('doc_limit_dev'), value: '1000' },
            { plan: getPlan('Free'), feature: getFeat('template_limit'), value: '1' },
            { plan: getPlan('Free'), feature: getFeat('max_gen_time'), value: '20' },
            { plan: getPlan('Free'), feature: getFeat('retention_period'), value: '600' },
            { plan: getPlan('Free'), feature: getFeat('use_webhooks'), value: 'false' },

            // --- PLAN STARTER (S) ---
            { plan: getPlan('Starter'), feature: getFeat('doc_limit_prod'), value: '1000' },
            { plan: getPlan('Starter'), feature: getFeat('doc_limit_dev'), value: '-1' },
            { plan: getPlan('Starter'), feature: getFeat('extra_doc_cost'), value: '0.10' },
            { plan: getPlan('Starter'), feature: getFeat('template_limit'), value: '-1' },
            { plan: getPlan('Starter'), feature: getFeat('max_gen_time'), value: '60' },
            { plan: getPlan('Starter'), feature: getFeat('retention_period'), value: '18000' },
            { plan: getPlan('Starter'), feature: getFeat('use_webhooks'), value: 'true' },

            // --- PLAN PAY-AS-YOU-GO (P) ---
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('doc_limit_prod'), value: '1500' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('doc_limit_dev'), value: '-1' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('extra_doc_cost'), value: '0' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('template_limit'), value: '-1' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('max_gen_time'), value: '60' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('retention_period'), value: '7200' },
            { plan: getPlan('Pay-as-you-go'), feature: getFeat('use_webhooks'), value: 'true' },

            // --- PLAN BUSINESS (B) ---
            { plan: getPlan('Business'), feature: getFeat('doc_limit_prod'), value: '7500' },
            { plan: getPlan('Business'), feature: getFeat('doc_limit_dev'), value: '-1' },
            { plan: getPlan('Business'), feature: getFeat('extra_doc_cost'), value: '0.05' },
            { plan: getPlan('Business'), feature: getFeat('template_limit'), value: '-1' },
            { plan: getPlan('Business'), feature: getFeat('max_gen_time'), value: '300' },
            { plan: getPlan('Business'), feature: getFeat('retention_period'), value: '86400' },
            { plan: getPlan('Business'), feature: getFeat('use_webhooks'), value: 'true' },
        ];

        // 🔥 Verificación: Mostrar qué planes y features se encontraron
        console.log('Planes encontrados:', allPlans.map(p => p.name));
        console.log('Features encontrados:', allFeatures.map(f => f.code));

        for (const e of entitlements) {
            if (e.plan && e.feature) {
                // 🔥 Usar Object literal con IDs en lugar de objetos completos
                const existing = await entitlementRepo.findOneBy({ 
                    plan: { id: e.plan.id }, 
                    feature: { id: e.feature.id } 
                });
                
                if (existing) {
                    existing.value = e.value;
                    await entitlementRepo.save(existing);
                    console.log(`✅ Actualizado: ${e.plan.name} - ${e.feature.code} = ${e.value}`);
                } else {
                    const newEntitlement = entitlementRepo.create({
                        plan: e.plan,
                        feature: e.feature,
                        value: e.value
                    });
                    await entitlementRepo.save(newEntitlement);
                    console.log(`✅ Creado: ${e.plan.name} - ${e.feature.code} = ${e.value}`);
                }
            } else {
                console.warn('⚠️  Saltando entitlement por falta de plan/feature:', {
                    plan: e.plan?.name,
                    feature: e.feature?.code,
                    value: e.value
                });
            }
        }

        console.log('✅ Seed completed! Your baby is ready to grow.');

        await transactionalEntityManager.query('COMMIT');
    });
};

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized for seeding...');
        await seedDatabase(AppDataSource);
        await AppDataSource.destroy();
        console.log('👋 Database connection closed.');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

run();