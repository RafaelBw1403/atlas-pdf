import { DataSource } from 'typeorm';
import { User } from '../entities/User.entity';
import { environment } from './enviroment';
import { ApiKey } from '../entities/ApiKey.entity';
import { UserAuthToken } from '../entities/UserAuthToken.entity';
import { GeneratedFile } from '../entities/GeneratedFIles.entity';
import { Feature } from '../entities/Feature.entity';
import { Plan } from '../entities/Plan.entity';
import { PlanEntitlement } from '../entities/PlanEntitlement.entity';
import { PdfAuditLog } from '../entities/PdfAuditLog.entity';
import { Subscription } from '../entities/Subscription.entity';
import { UsageCounter } from '../entities/UsageCounter.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: environment.postgresUri,
    entities: [
        ApiKey,
        Feature,
        GeneratedFile,
        PdfAuditLog,
        Plan,
        PlanEntitlement,
        Subscription,
        UsageCounter,
        User,
        UserAuthToken,
    ],
    schema: 'public',
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    migrations: [__dirname + '/../migrations/*.ts'],
});