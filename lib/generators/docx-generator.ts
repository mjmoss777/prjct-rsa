import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
} from 'docx';
import type { ResumeData } from '@/config/db/schema/ats-schema';
import type { TemplateStyle, SectionKey } from '@/lib/templates/types';

const TWIP_INCH = 1440;
const PAGE_WIDTH_TWIPS = 12240; // 8.5 inches

function pt(size: number) {
  return size * 2; // docx uses half-points
}

function marginTwips(margin: number) {
  // margin is in CSS px; convert roughly to twips (1px ≈ 15 twips at 96dpi)
  return Math.round(margin * 15);
}

function contactLine(data: ResumeData['contactInfo']): string {
  const parts: string[] = [];
  if (data.email) parts.push(data.email);
  if (data.phone) parts.push(data.phone);
  if (data.location) parts.push(data.location);
  if (data.linkedIn) parts.push(data.linkedIn);
  if (data.website) parts.push(data.website);
  return parts.join('  |  ');
}

function sectionRule(style: TemplateStyle): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: style.showRules ? BorderStyle.SINGLE : BorderStyle.NONE, size: 1, color: 'CCCCCC' },
    },
    spacing: { after: 60 },
  });
}

function sectionTitle(title: string, style: TemplateStyle): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: style.fonts.heading,
        size: pt(style.fontSizes.sectionTitle),
        bold: true,
        color: style.accent.replace('#', ''),
        characterSpacing: 60,
      }),
    ],
    spacing: { before: pt(style.spacing.sectionGap), after: 60 },
    border: style.showRules
      ? { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } }
      : undefined,
  });
}

function bodyText(text: string, style: TemplateStyle): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, font: style.fonts.body, size: pt(style.fontSizes.body), color: '333333' }),
    ],
    spacing: { after: 40, line: Math.round(style.lineHeights.body / style.fontSizes.body * 240) },
  });
}

function bulletItem(text: string, style: TemplateStyle): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, font: style.fonts.body, size: pt(style.fontSizes.body), color: '333333' }),
    ],
    bullet: { level: 0 },
    spacing: { after: pt(style.spacing.bulletGap) },
  });
}

function buildSummary(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (!data.professionalSummary) return [];
  return [sectionTitle('Professional Summary', style), bodyText(data.professionalSummary, style)];
}

function buildExperience(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (data.workExperience.length === 0) return [];
  const paras: Paragraph[] = [sectionTitle('Experience', style)];

  for (const job of data.workExperience) {
    // Job title + dates on same line using tab stop
    paras.push(new Paragraph({
      children: [
        new TextRun({ text: job.jobTitle, font: style.fonts.body, size: pt(style.fontSizes.jobTitle), bold: true, color: '1A1A1A' }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: `${job.startDate} – ${job.endDate}`, font: style.fonts.body, size: pt(style.fontSizes.small), color: '666666' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: PAGE_WIDTH_TWIPS - marginTwips(style.spacing.pageMargin) * 2 }],
      spacing: { before: pt(style.spacing.itemGap), after: 20 },
    }));

    // Company + location
    paras.push(new Paragraph({
      children: [
        new TextRun({
          text: `${job.company}${job.location ? `, ${job.location}` : ''}`,
          font: style.fonts.body,
          size: pt(style.fontSizes.body),
          color: '444444',
        }),
      ],
      spacing: { after: 40 },
    }));

    // Bullets
    for (const bullet of job.bullets) {
      paras.push(bulletItem(bullet, style));
    }
  }

  return paras;
}

function buildEducation(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (data.education.length === 0) return [];
  const paras: Paragraph[] = [sectionTitle('Education', style)];

  for (const edu of data.education) {
    paras.push(new Paragraph({
      children: [
        new TextRun({ text: edu.degree, font: style.fonts.body, size: pt(style.fontSizes.jobTitle), bold: true, color: '1A1A1A' }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: edu.graduationDate, font: style.fonts.body, size: pt(style.fontSizes.small), color: '666666' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: PAGE_WIDTH_TWIPS - marginTwips(style.spacing.pageMargin) * 2 }],
      spacing: { before: pt(style.spacing.itemGap), after: 20 },
    }));

    paras.push(new Paragraph({
      children: [
        new TextRun({
          text: `${edu.institution}${edu.location ? `, ${edu.location}` : ''}`,
          font: style.fonts.body,
          size: pt(style.fontSizes.body),
          color: '444444',
        }),
      ],
      spacing: { after: 20 },
    }));

    if (edu.gpa || edu.honors) {
      const parts: string[] = [];
      if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
      if (edu.honors) parts.push(edu.honors);
      paras.push(new Paragraph({
        children: [
          new TextRun({ text: parts.join(' | '), font: style.fonts.body, size: pt(style.fontSizes.small), color: '555555' }),
        ],
        spacing: { after: 20 },
      }));
    }
  }

  return paras;
}

function buildSkills(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (data.skills.length === 0) return [];
  const paras: Paragraph[] = [sectionTitle('Skills', style)];

  for (const group of data.skills) {
    paras.push(new Paragraph({
      children: [
        new TextRun({ text: `${group.category}: `, font: style.fonts.body, size: pt(style.fontSizes.body), bold: true, color: '1A1A1A' }),
        new TextRun({ text: group.items.join(', '), font: style.fonts.body, size: pt(style.fontSizes.body), color: '333333' }),
      ],
      spacing: { after: pt(style.spacing.bulletGap) },
    }));
  }

  return paras;
}

function buildCertifications(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (!data.certifications || data.certifications.length === 0) return [];
  const paras: Paragraph[] = [sectionTitle('Certifications', style)];

  for (const cert of data.certifications) {
    paras.push(new Paragraph({
      children: [
        new TextRun({ text: cert.name, font: style.fonts.body, size: pt(style.fontSizes.body), bold: true }),
        new TextRun({ text: ` – ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`, font: style.fonts.body, size: pt(style.fontSizes.body), color: '333333' }),
      ],
      spacing: { after: pt(style.spacing.bulletGap) },
    }));
  }

  return paras;
}

function buildAdditional(data: ResumeData, style: TemplateStyle): Paragraph[] {
  if (!data.additionalSections || data.additionalSections.length === 0) return [];
  const paras: Paragraph[] = [];

  for (const section of data.additionalSections) {
    paras.push(sectionTitle(section.title, style));
    paras.push(bodyText(section.content, style));
  }

  return paras;
}

const sectionBuilders: Record<SectionKey, (data: ResumeData, style: TemplateStyle) => Paragraph[]> = {
  summary: buildSummary,
  experience: buildExperience,
  education: buildEducation,
  skills: buildSkills,
  certifications: buildCertifications,
  additional: buildAdditional,
};

export async function generateDocx(data: ResumeData, style: TemplateStyle): Promise<Buffer> {
  const margin = marginTwips(style.spacing.pageMargin);
  const { contactInfo } = data;

  // Header paragraphs
  const header: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: contactInfo.fullName || 'Your Name',
          font: style.fonts.heading,
          size: pt(style.fontSizes.name),
          color: style.accent.replace('#', ''),
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: contactLine(contactInfo),
          font: style.fonts.body,
          size: pt(style.fontSizes.small),
          color: '555555',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: pt(style.spacing.sectionGap) },
    }),
  ];

  // Build sections in template order
  const sectionParas: Paragraph[] = [];
  for (const key of style.sectionOrder) {
    const builder = sectionBuilders[key];
    sectionParas.push(...builder(data, style));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: margin, bottom: margin, left: margin, right: margin },
        },
      },
      children: [...header, ...sectionParas],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
