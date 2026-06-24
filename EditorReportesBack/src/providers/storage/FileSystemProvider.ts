import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider } from '../../interface/IStorageProvider.interface';

export class FileSystemProvider implements IStorageProvider {
  private uploadDir = path.resolve(__dirname, '../../../uploads');

  async save(file: Buffer, fileName: string, folder: 'pdf' | 'assets'): Promise<string> {
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, fileName);

    // Ensure the sub-folder (pdf or assets) exists before writing
    await fs.mkdir(folderPath, { recursive: true });
    
    await fs.writeFile(filePath, file);
    return filePath; 
  }

  async delete(fileName: string, folder: 'pdf' | 'assets'): Promise<void> {
    const filePath = path.join(this.uploadDir, folder, fileName);
    await fs.unlink(filePath);
  }

  async getSignedUrl(fileName: string, folder: 'pdf' | 'assets'): Promise<string> {
    // For local dev, we just return the local path or a local server URL
    return path.join(this.uploadDir, folder, fileName);
  }
}