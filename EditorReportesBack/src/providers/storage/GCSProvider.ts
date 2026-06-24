import { Storage } from '@google-cloud/storage';
import { IStorageProvider } from '../../interface/IStorageProvider.interface';

export class GCSProvider implements IStorageProvider {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        const keyPath = process.env.GCP_KEY_PATH;
        const projectId = process.env.GCP_PROJECT_ID;

        if (!keyPath || !projectId) {
            throw new Error("GCS_STORAGE_ERROR: Missing GCP_KEY_PATH or GCP_PROJECT_ID in environment variables.");
        }

        this.storage = new Storage({
            keyFilename: keyPath,
            projectId: projectId,
        });
        
        this.bucketName = process.env.GCP_BUCKET_NAME || '';
    }

    async save(file: Buffer, fileName: string, folder: 'pdf' | 'assets'): Promise<string> {
        // const bucket = this.storage.bucket(this.bucketName);
        // const blob = bucket.file(fileName);
        // await blob.save(file);
        // return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
        const bucket = this.storage.bucket(this.bucketName);
        // This puts the file in the correct "folder"
        const blob = bucket.file(`${folder}/${fileName}`); 
        
        await blob.save(file);
        return fileName;
    }

    async delete(fileName: string, folder: 'pdf' | 'assets'): Promise<void> {
        await this.storage.bucket(this.bucketName).file(`${folder}/${fileName}`).delete();
    }

    async getSignedUrl(fileName: string, folder: 'pdf' | 'assets'): Promise<string> {
        const options: any = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // The link lasts for 15 minutes
        };

        const [url] = await this.storage
            .bucket(this.bucketName)
            .file(`${folder}/${fileName}`)
            .getSignedUrl(options);

        return url;
    }
}