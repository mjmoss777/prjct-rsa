import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageBackend } from './index';

function getClient() {
  return new S3Client({
    region: process.env.S3_REGION ?? 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // needed for R2, MinIO, Backblaze
  });
}

function getBucket() {
  return process.env.S3_BUCKET!;
}

export const s3Storage: StorageBackend = {
  async upload(key, data, contentType) {
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    return key;
  },

  async getUrl(key) {
    const client = getClient();
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: getBucket(), Key: key }),
      { expiresIn: 3600 },
    );
  },

  async remove(key) {
    const client = getClient();
    await client.send(
      new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
    );
  },
};
