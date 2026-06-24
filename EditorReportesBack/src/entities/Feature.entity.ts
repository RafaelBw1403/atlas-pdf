import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlanEntitlement } from './PlanEntitlement.entity';


// Note: The master catalog of features (e.g., doc_limit, use_webhooks).
@Entity('features')
export class Feature {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', unique: true })
    code!: string; // e.g., 'doc_limit'

    @Column({ type: 'text' })
    description!: string;

    @Column({ 
        type: 'enum', 
        enum: ['int', 'bool', 'float'], 
        default: 'int' 
    })
    data_type!: string;

    @OneToMany(() => PlanEntitlement, (entitlement) => entitlement.feature)
    entitlements!: PlanEntitlement[];
}