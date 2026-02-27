import { PDFParse } from 'pdf-parse';
import path from 'node:path';

// Point pdfjs-dist to the actual worker file so the fake (inline) worker
// can dynamically import it in the Next.js server bundle.
PDFParse.setWorker(
  path.join(
    path.dirname(require.resolve('pdfjs-dist/package.json')),
    'legacy/build/pdf.worker.mjs',
  ),
);

const SAFE_FONTS = [
  'arial', 'calibri', 'garamond', 'georgia', 'helvetica',
  'times new roman', 'times', 'cambria', 'verdana', 'tahoma',
  'trebuchet', 'courier new', 'courier',
];

export type PdfParseResult = {
  text: string;
  pageCount: number;
  hasImages: boolean;
  fontNames: string[];
  isImageOnly: boolean;
  metadata: Record<string, string>;
};

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const pdf = new PDFParse({ data: new Uint8Array(buffer) });

  const [textResult, infoResult] = await Promise.all([
    pdf.getText(),
    pdf.getInfo(),
  ]);

  const text = textResult.text?.trim() ?? '';
  const pageCount = textResult.total;
  const isImageOnly = text.length < 50;

  // Extract font names from info metadata if available
  const fontNames: string[] = [];
  if (infoResult.info?.Font) {
    const fontInfo = infoResult.info.Font;
    if (typeof fontInfo === 'string') {
      fontNames.push(fontInfo);
    } else if (Array.isArray(fontInfo)) {
      fontNames.push(...fontInfo.map(String));
    }
  }

  const metadata: Record<string, string> = {};
  if (infoResult.info) {
    for (const [key, value] of Object.entries(infoResult.info)) {
      if (typeof value === 'string') {
        metadata[key] = value;
      }
    }
  }

  const hasImages = text.includes('\ufffd') || (pageCount > 0 && isImageOnly);

  await pdf.destroy();

  return {
    text,
    pageCount,
    hasImages,
    fontNames,
    isImageOnly,
    metadata,
  };
}

export function getUnsafeFonts(fontNames: string[]): string[] {
  return fontNames.filter(
    (font) => !SAFE_FONTS.some((safe) => font.toLowerCase().includes(safe))
  );
}
