import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User.entity';

@Entity('api_keys')
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 100,
        unique: true
    })
    api_key!: string;  // Ejemplo: "prod_xxxxx" o "dev_xxxxx"

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE'  // Si eliminas usuario, se eliminan sus keys
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;


    @Column({
        type: 'varchar',
        length: 20,
        default: 'development'
    })
    type!: 'development' | 'production';

    @Column({
        type: 'int',
        default: 60
    })
    rate_limit!: number;  // Límite por minuto (requests por minuto)

    @Column({
        type: 'int',
        name: 'rate_limit_per_day',
        default: 1000
    })
    rateLimitPerDay!: number;  // Límite diario

    @Column({
        type: 'bigint',
        name: 'total_requests',
        default: 0
    })
    totalRequests!: number;

    @Column({
        type: 'timestamp',
        name: 'last_request_at',
        nullable: true
    })
    lastRequestAt?: Date;

    @Column({
        type: 'boolean',
        name: 'is_active',
        default: true
    })
    isActive!: boolean;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at'
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at'
    })
    updatedAt!: Date;

    // Método helper para verificar si puede hacer más requests
    canMakeRequest(requestsToday: number): boolean {
        if (!this.isActive) return false;
        if (requestsToday >= this.rateLimitPerDay) return false;
        return true;
    }

    // Método para formatear la key para mostrar (oculta parte)
    getMaskedKey(): string {
        if (this.api_key.length <= 8) return '•••••••';
        return `${this.api_key.substring(0, 4)}••••${this.api_key.substring(this.api_key.length - 4)}`;
    }
}