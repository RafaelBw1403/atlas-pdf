import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { ApiKey } from './ApiKey.entity';

// Note: Tracks every PDF generation for analytics and debugging.
@Entity('pdf_audit_log')
export class PdfAuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    user!: User | null;

    @ManyToOne(() => ApiKey, { onDelete: 'SET NULL', nullable: true })
    apiKey!: ApiKey | null;

    @CreateDateColumn()
    generated_at!: Date;

    @Column({ type: 'int' })
    generation_time_ms!: number;

    @Column({ type: 'varchar', nullable: true })
    source_ip!: string;

    @Column({ type: 'int' })
    file_size_bytes!: number;

    @Column({ type: 'varchar', nullable: true })
    document_id!: string;
}