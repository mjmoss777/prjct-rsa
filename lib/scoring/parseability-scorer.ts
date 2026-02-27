import type { ParsedResume } from '@/lib/parsers';

export type ParseabilityScore = {
  score: number;
  weight: number;
  fileFormatQuality: string;
  fontSafety: string[];
  layoutSafety: string;
  headerFooterIssues: string[];
  graphicElements: string[];
  feedback: string[];
};

type Deduction = {
  points: number;
  feedback: string;
  category: 'format' | 'layout' | 'font' | 'header' | 'graphic';
};

export function scoreParseability(parsed: ParsedResume): ParseabilityScore {
  const deductions: Deduction[] = [];
  const { parseability, fileType } = parsed;

  // Image-only PDF — ATS can't read it at all
  if (parseability.isImageOnly) {
    deductions.push({
      points: 100,
      feedback: 'Your PDF appears to be image-based (scanned). ATS cannot extract any text from it. Re-create as a text-based document.',
      category: 'format',
    });
  }

  // Tables detected
  if (parseability.hasTables) {
    deductions.push({
      points: 20,
      feedback: 'Tables detected in your document. ATS systems often read table cells in the wrong order, scrambling your information. Use bullet points or plain text instead.',
      category: 'layout',
    });
  }

  // Text boxes detected
  if (parseability.hasTextBoxes) {
    deductions.push({
      points: 15,
      feedback: 'Text boxes detected. Content inside text boxes is frequently invisible to ATS parsers or extracted out of order.',
      category: 'layout',
    });
  }

  // Multi-column layout
  if (parseability.hasMultipleColumns) {
    deductions.push({
      points: 20,
      feedback: 'Multi-column layout detected. ATS reads left-to-right, top-to-bottom, which can scramble content across columns. Use a single-column layout.',
      category: 'layout',
    });
  }

  // Images/graphics
  if (parseability.hasImages) {
    deductions.push({
      points: 5,
      feedback: 'Images or graphics detected. These are invisible to ATS parsers. If you have icons next to contact info, replace them with plain text.',
      category: 'graphic',
    });
  }

  // Header/footer content
  if (parseability.hasHeaderFooterContent) {
    deductions.push({
      points: 10,
      feedback: 'Important content may be in the document header or footer. About 25% of ATS systems miss this content. Place your contact information in the main document body.',
      category: 'header',
    });
  }

  // Non-standard fonts
  for (const font of parseability.unsafeFonts) {
    deductions.push({
      points: 5,
      feedback: `Non-standard font "${font}" detected. If the ATS doesn't have this font, text may render incorrectly. Use standard fonts: Arial, Calibri, Georgia, Times New Roman.`,
      category: 'font',
    });
  }

  const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0);
  const score = Math.max(0, 100 - totalDeduction);

  // Build category summaries
  const formatDeductions = deductions.filter((d) => d.category === 'format');
  const layoutDeductions = deductions.filter((d) => d.category === 'layout');
  const fontDeductions = deductions.filter((d) => d.category === 'font');

  const fileFormatQuality = parseability.isImageOnly
    ? 'image-only'
    : fileType === 'docx'
      ? 'excellent'
      : 'good';

  const layoutIssues = layoutDeductions.map((d) => d.feedback);
  const layoutSafety = layoutIssues.length === 0
    ? 'clean'
    : layoutIssues.length <= 1
      ? 'minor-issues'
      : 'major-issues';

  return {
    score,
    weight: 0.125,
    fileFormatQuality,
    fontSafety: parseability.unsafeFonts.length === 0
      ? ['All fonts are ATS-safe']
      : parseability.unsafeFonts,
    layoutSafety,
    headerFooterIssues: deductions
      .filter((d) => d.category === 'header')
      .map((d) => d.feedback),
    graphicElements: deductions
      .filter((d) => d.category === 'graphic')
      .map((d) => d.feedback),
    feedback: [
      ...formatDeductions.map((d) => d.feedback),
      ...layoutDeductions.map((d) => d.feedback),
      ...fontDeductions.map((d) => d.feedback),
      ...(score === 100 ? ['Your document format is fully ATS-compatible.'] : []),
    ],
  };
}
