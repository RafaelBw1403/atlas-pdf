import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    Index, 
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { ApiKey } from './ApiKey.entity';
import { User } from './User.entity';

export enum FileStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    EXPIRED = 'expired'
}

@Entity('generated_files')
export class GeneratedFile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 20 })
    slug!: string; // The "token" for the URL: www.algo.com/v/kjhgffu65765

    @Column({ type: 'varchar', length: 255 })
    original_name!: string;

    @Column({ type: 'text' })
    storage_path!: string; // Local path or GCS key

    @Column({
        type: 'enum',
        enum: FileStatus,
        default: FileStatus.PENDING
    })
    status!: FileStatus;

    @Column({ type: 'boolean', default: false })
    delete_immediately!: boolean;

    @Column({ type: 'timestamp' })
    expires_at!: Date;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @ManyToOne(() => ApiKey, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'api_key_id' })
    apiKey!: ApiKey;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;
}