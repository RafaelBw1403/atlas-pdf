import 'reflect-metadata';
import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    OneToMany
} from 'typeorm';
import { ApiKey } from './ApiKey.entity';
import { UserAuthToken } from './UserAuthToken.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ 
        type: 'varchar', 
        unique: true, 
        length: 255 
    })
    email!: string;

    @Column({ 
        type: 'varchar', 
        length: 255 
    })
    password_hash!: string;

    @Column({ 
        type: 'varchar', 
        length: 255 
    })
    name!: string;

    @Column({ 
        type: 'varchar', 
        nullable: true, 
        length: 255 
    })
    google_id!: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    refresh_token_hash?: string;

    @Column({
        type: 'boolean',
        default: true
    })
    active!: boolean;

    @Column({
        type: 'boolean',
        default: false
    })
    isAdmin!: boolean;

    @Column({
        type: 'boolean',
        default: false
    })
    is_blocked!: boolean;

    @Column({
        type: 'timestamp',
        nullable: true
    })
    blocked_until!: Date;

    @Column({
        type: 'boolean',
        default: false
    })
    is_verified!: boolean;

    @CreateDateColumn({ 
        type: 'timestamp' 
    })
    created_at!: Date;

    @UpdateDateColumn({ 
        type: 'timestamp' 
    })
    updated_at!: Date;

    

    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apiKeys!: ApiKey[];
    @OneToMany(() => UserAuthToken, (authToken) => authToken.user)
    authTokens!: UserAuthToken[];
}