import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';

// Note: Tracks usage per user per feature (e.g., 5/20 documents used).
@Entity('usage_counters')
export class UsageCounter {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @Column({ type: 'varchar' })
    featureCode!: string;

    @Column({ type: 'int', default: 0 })
    current_usage!: number;

    @Column({ type: 'int', default: 0 })
    overage_usage!: number;

    @Column({ type: 'timestamp' })
    last_reset!: Date;
}