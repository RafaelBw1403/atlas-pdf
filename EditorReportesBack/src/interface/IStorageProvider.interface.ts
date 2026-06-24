

export interface IStorageProvider {
  save(file: Buffer, fileName: string, folder: 'pdf' | 'assets'): Promise<string>;
  delete(fileName: string, folder: 'pdf' | 'assets'): Promise<void>;

  getSignedUrl(fileName: string, folder: 'pdf' | 'assets'): Promise<string>;
}