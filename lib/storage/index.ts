import { localStorage } from './local';
import { s3Storage } from './s3';

export type StorageBackend = {
  upload(key: string, data: Buffer, contentType: string): Promise<string>;
  getUrl(key: string): Promise<string>;
  remove(key: string): Promise<void>;
};

export function getStorage(): StorageBackend {
  const backend = process.env.STORAGE_BACKEND ?? 'local';
  if (backend === 's3') return s3Storage;
  return localStorage;
}
