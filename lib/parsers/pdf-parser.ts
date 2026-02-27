import { readPdf, type PdfReadResult } from './pdf-reader';

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
  const result: PdfReadResult = readPdf(buffer);

  const text = result.text.trim();
  const isImageOnly = text.length < 50;

  return {
    text,
    pageCount: result.pageCount,
    hasImages: result.hasImages || (result.pageCount > 0 && isImageOnly),
    fontNames: result.fontNames,
    isImageOnly,
    metadata: result.metadata,
  };
}

export function getUnsafeFonts(fontNames: string[]): string[] {
  return fontNames.filter(
    (font) => !SAFE_FONTS.some((safe) => font.toLowerCase().includes(safe))
  );
}
