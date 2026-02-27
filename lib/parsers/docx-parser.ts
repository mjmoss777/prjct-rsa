import mammoth from 'mammoth';

export type DocxParseResult = {
  text: string;
  html: string;
  hasTables: boolean;
  hasTextBoxes: boolean;
  hasMultipleColumns: boolean;
  hasImages: boolean;
  fontNames: string[];
};

export async function parseDocx(buffer: Buffer): Promise<DocxParseResult> {
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  const text = textResult.value.trim();
  const html = htmlResult.value;

  const hasTables = /<table[\s>]/i.test(html);
  const hasImages = /<img[\s>]/i.test(html);

  // Text boxes in DOCX are rendered as nested divs or special elements by mammoth
  const hasTextBoxes =
    /mc:AlternateContent/i.test(html) ||
    /w:txbxContent/i.test(html) ||
    /textbox/i.test(html);

  // Multi-column detection: mammoth doesn't directly expose column info,
  // but we can detect it from section properties or unusual spacing patterns
  const hasMultipleColumns =
    /w:cols\s+w:num="[2-9]"/i.test(html) ||
    /columns.*?column-count:\s*[2-9]/i.test(html);

  // Extract font names from HTML style attributes
  const fontNames = extractFontsFromHtml(html);

  return {
    text,
    html,
    hasTables,
    hasTextBoxes,
    hasMultipleColumns,
    hasImages,
    fontNames,
  };
}

function extractFontsFromHtml(html: string): string[] {
  const fontSet = new Set<string>();
  const fontRegex = /font-family:\s*["']?([^"';,}]+)/gi;
  let match;
  while ((match = fontRegex.exec(html)) !== null) {
    fontSet.add(match[1].trim());
  }
  return Array.from(fontSet);
}
