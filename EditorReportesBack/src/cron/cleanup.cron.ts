import cron from 'node-cron';
import { AppDataSource } from '../config/typeorm.config';
import { FileStatus, GeneratedFile } from '../entities/GeneratedFIles.entity';
import { LessThan } from 'typeorm';
import { StorageManager } from '../manager/storage.manager';
import { pdfQueue } from '../queues/pdf.queue';

const CRON_SCHEDULE = process.env.CLEANUP_CRON_SCHEDULE || '*/5 * * * *';

cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[Cleanup Cron] Starting (schedule: ${CRON_SCHEDULE})`);

    try {
        const fileRepo = AppDataSource.getRepository(GeneratedFile);
        const now = new Date();

        const candidates = await fileRepo.find({
            where: [
                { status: FileStatus.EXPIRED },
                { delete_immediately: true },
                { expires_at: LessThan(now) }
            ]
        });

        console.log(`[Cleanup Cron] ${candidates.length} candidate(s) found.`);

        let deletedCount = 0;
        for (const file of candidates) {
            console.log(`[Cleanup Cron] Processing ${file.slug} (status=${file.status}, expires_at=${file.expires_at}, delete_immediately=${file.delete_immediately})`);

            try {
                const provider = StorageManager.getProvider();

                try {
                    await provider.delete(file.slug + '.pdf', 'pdf');
                } catch (err: any) {
                    if (err.code === 'ENOENT') {
                        console.warn(`[Cleanup Cron] Physical file not found for ${file.slug}, continuing with DB delete`);
                    } else {
                        console.error(`[Cleanup Cron] Error deleting physical file for ${file.slug}:`, err);
                    }
                }

                await fileRepo.remove(file);
                deletedCount++;
            } catch (error) {
                console.error(`[Cleanup Cron] Error cleaning up file ${file.id} (${file.slug}):`, error);
            }
        }

        console.log(`[Cleanup Cron] Done. Deleted ${deletedCount} file(s) from DB.`);
    } catch (error) {
        console.error('[Cleanup Cron] Error in Document Cleanup:', error);
    }
});

cron.schedule('0 2 * * *', async () => {
    console.log('--- Cleaning Queue History ---');
    try {
        const limit = 5000;
        await pdfQueue.clean(3600000, limit, 'completed');
        await pdfQueue.clean(172800000, limit, 'failed');
        console.log('Queue cleanup finished.');
    } catch (error) {
        console.error('Queue cleanup failed:', error);
    }
});