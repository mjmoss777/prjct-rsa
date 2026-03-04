import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import type { StorageBackend } from './index';

const UPLOAD_DIR = join(process.cwd(), '.uploads');

async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export const localStorage: StorageBackend = {
  async upload(key, data, _contentType) {
    await ensureDir();
    const filePath = join(UPLOAD_DIR, key);
    // Ensure subdirectories exist
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (dir !== UPLOAD_DIR) await mkdir(dir, { recursive: true });
    await writeFile(filePath, data);
    return key;
  },

  async getUrl(key) {
    // Served via /api/files/[...path] route
    return `/api/files/${key}`;
  },

  async remove(key) {
    const filePath = join(UPLOAD_DIR, key);
    await unlink(filePath).catch(() => {});
  },
};
