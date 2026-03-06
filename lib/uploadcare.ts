const UPLOAD_URL = 'https://upload.uploadcare.com/base/';

export async function uploadToUploadcare(
  file: File,
  signature: string,
  expire: number,
): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_UC_PUB_KEY;
  if (!publicKey) throw new Error('NEXT_PUBLIC_UC_PUB_KEY is not configured');

  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', publicKey);
  formData.append('UPLOADCARE_STORE', '1');
  formData.append('signature', signature);
  formData.append('expire', String(expire));
  formData.append('file', file);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }

  const data = await res.json();
  return `https://ucarecdn.com/${data.file}/`;
}
