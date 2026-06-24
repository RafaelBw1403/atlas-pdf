
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlanEntitlement } from './PlanEntitlement.entity';
import { Subscription } from './Subscription.entity';


// Note: Defines the subscription tiers (Free, Starter, etc.).
@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Column({ type: 'varchar', default: 'USD' })
    currency!: string;

    @OneToMany(() => PlanEntitlement, (entitlement) => entitlement.plan)
    entitlements!: PlanEntitlement[];

    @OneToMany(() => Subscription, (sub) => sub.plan)
    subscriptions!: Subscription[];
}