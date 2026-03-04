import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), '.uploads');

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const filePath = join(UPLOAD_DIR, ...path);

  // Prevent directory traversal
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    const ext = filePath.split('.').pop() ?? '';
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
