import { IStorageProvider } from '../interface/IStorageProvider.interface';
import { FileSystemProvider } from '../providers/storage/FileSystemProvider';
// import { GCSProvider } from '../providers/storage/GCSProvider';

export class StorageManager {
    private static instance: IStorageProvider;

    /**
     * Returns the correct provider based on PROJECT_MODE.
     * It follows the Singleton pattern to avoid re-instantiating 
     * providers on every call.
     */
    static getProvider(): IStorageProvider {
        if (this.instance) return this.instance;

        // [DISABLED] GCS — solo modo local por ahora
        // const mode = process.env.PROJECT_MODE || 'local';
        // if (mode === 'saas') {
        //     this.instance = new GCSProvider();
        // } else {
        //     this.instance = new FileSystemProvider();
        // }

        this.instance = new FileSystemProvider();
        return this.instance;
    }
}