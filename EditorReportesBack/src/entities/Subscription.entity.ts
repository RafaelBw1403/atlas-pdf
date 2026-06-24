import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Plan } from './Plan.entity';

// Note: Links your User to a Plan. Handles the billing cycle.
@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;

    @ManyToOne(() => Plan, (plan) => plan.subscriptions)
    plan!: Plan;

    @Column({ type: 'varchar', default: 'active' })
    status!: string;

    @Column({ type: 'timestamp' })
    current_period_start!: Date;

    @Column({ type: 'timestamp' })
    current_period_end!: Date;
}