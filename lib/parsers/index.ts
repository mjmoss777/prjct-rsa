import { parsePdf, getUnsafeFonts, type PdfParseResult } from './pdf-parser';
import { parseDocx, type DocxParseResult } from './docx-parser';

export type ParsedResume = {
  text: string;
  fileType: 'pdf' | 'docx';
  parseability: {
    isImageOnly: boolean;
    hasTables: boolean;
    hasTextBoxes: boolean;
    hasMultipleColumns: boolean;
    hasImages: boolean;
    fontNames: string[];
    unsafeFonts: string[];
    hasHeaderFooterContent: boolean;
  };
  raw: PdfParseResult | DocxParseResult;
};

export async function parseResume(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return parsePdfResume(buffer);
  }

  if (ext === 'docx' || ext === 'doc') {
    return parseDocxResume(buffer);
  }

  throw new Error(`Unsupported file format: .${ext}. Please upload a PDF or DOCX file.`);
}

async function parsePdfResume(buffer: Buffer): Promise<ParsedResume> {
  const result = await parsePdf(buffer);
  const unsafeFonts = getUnsafeFonts(result.fontNames);

  // Heuristic: if text contains patterns like page numbers at regular intervals
  // with very different content patterns, it may have header/footer content
  const hasHeaderFooterContent = detectHeaderFooterContent(result.text);

  return {
    text: result.text,
    fileType: 'pdf',
    parseability: {
      isImageOnly: result.isImageOnly,
      hasTables: false, // PDF parser can't reliably detect tables from text
      hasTextBoxes: false, // PDF parser can't detect text boxes
      hasMultipleColumns: detectMultipleColumns(result.text),
      hasImages: result.hasImages,
      fontNames: result.fontNames,
      unsafeFonts,
      hasHeaderFooterContent,
    },
    raw: result,
  };
}

async function parseDocxResume(buffer: Buffer): Promise<ParsedResume> {
  const result = await parseDocx(buffer);
  const unsafeFonts = getUnsafeFonts(result.fontNames);

  return {
    text: result.text,
    fileType: 'docx',
    parseability: {
      isImageOnly: result.text.length < 50,
      hasTables: result.hasTables,
      hasTextBoxes: result.hasTextBoxes,
      hasMultipleColumns: result.hasMultipleColumns,
      hasImages: result.hasImages,
      fontNames: result.fontNames,
      unsafeFonts,
      hasHeaderFooterContent: false, // DOCX mammoth strips headers/footers
    },
    raw: result,
  };
}

/**
 * Heuristic: detect multi-column layout from extracted text.
 * Multi-column PDFs often produce text with abnormally short lines
 * mixed with normal lines, or repeated patterns of short fragments.
 */
function detectMultipleColumns(text: string): boolean {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 10) return false;

  const lengths = lines.map((l) => l.trim().length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  // If many lines are very short relative to average, it may be multi-column
  const shortLines = lengths.filter((l) => l < avgLength * 0.4).length;
  return shortLines / lines.length > 0.4;
}

/**
 * Heuristic: detect header/footer content from repeated text patterns.
 * Headers/footers appear as the same text at regular intervals.
 */
function detectHeaderFooterContent(text: string): boolean {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 20) return false;

  // Check if first and last few lines contain phone/email patterns
  // that might indicate contact info in header/footer
  const headerLines = lines.slice(0, 3).join(' ');
  const footerLines = lines.slice(-3).join(' ');

  const contactPattern = /(\d{3}[-.)]\s?\d{3}[-.)]\s?\d{4})|(\S+@\S+\.\S+)/;
  const pagePattern = /page\s+\d+\s*(of\s+\d+)?/i;

  return pagePattern.test(footerLines) || (contactPattern.test(footerLines) && contactPattern.test(headerLines));
}
