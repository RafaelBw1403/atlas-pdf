import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn,
    Index
} from 'typeorm';
import { User } from './User.entity';

// Definimos los tipos de tokens para evitar errores de dedo
export enum AuthTokenType {
    EMAIL_VERIFICATION = 'email_verification',
    PASSWORD_RECOVERY = 'password_recovery'
}

@Entity('user_auth_tokens')
export class UserAuthToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ 
        type: 'varchar', 
        length: 255 
    })
    @Index() // Indexamos para que la búsqueda del token sea ultra rápida
    token_hash!: string;

    @Column({
        type: 'enum',
        enum: AuthTokenType
    })
    type!: AuthTokenType;

    @Column({ type: 'timestamp' })
    expires_at!: Date;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @Column({ type: 'timestamp', nullable: true })
    used_at!: Date;

    @Column({ type: 'int', default: 0 })
    attempts!: number;

    @Column({ type: 'int', default: 3 })
    max_attempts!: number;

    // Relación con el usuario
    @ManyToOne(() => User, (user) => user.authTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    user_id!: string;
}