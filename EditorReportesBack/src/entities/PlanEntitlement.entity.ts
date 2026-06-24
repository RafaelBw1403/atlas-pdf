import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Plan } from './Plan.entity';
import { Feature } from './Feature.entity';

// Note: Connects a Plan to a Feature and sets the limit value.
@Entity('plan_entitlements')
export class PlanEntitlement {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @ManyToOne(() => Plan, (plan) => plan.entitlements)
    plan!: Plan;

    @ManyToOne(() => Feature, (feature) => feature.entitlements)
    feature!: Feature;

    @Column({ type: 'varchar' })
    value!: string; // Your code will cast this based on Feature.data_type
}