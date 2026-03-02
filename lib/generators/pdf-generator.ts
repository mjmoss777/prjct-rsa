import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer, Font } from '@react-pdf/renderer';
import type { ResumeData } from '@/config/db/schema/ats-schema';
import type { TemplateStyle, SectionKey } from '@/lib/templates/types';

// Register standard system fonts — react-pdf ships with Helvetica by default.
// For other fonts, we register them as aliases. Since we can't embed
// actual Calibri/Arial/Georgia/Times New Roman files, we map to
// built-in PDF standard fonts.
const FONT_MAP: Record<string, string> = {
  'Calibri': 'Helvetica',
  'Arial': 'Helvetica',
  'Georgia': 'Times-Roman',
  'Times New Roman': 'Times-Roman',
  'Helvetica': 'Helvetica',
};

function mapFont(name: string): string {
  return FONT_MAP[name] ?? 'Helvetica';
}

function contactParts(info: ResumeData['contactInfo']): string[] {
  const parts: string[] = [];
  if (info.email) parts.push(info.email);
  if (info.phone) parts.push(info.phone);
  if (info.location) parts.push(info.location);
  if (info.linkedIn) parts.push(info.linkedIn);
  if (info.website) parts.push(info.website);
  return parts;
}

function SectionTitle({ title, style: t }: { title: string; style: TemplateStyle }) {
  return React.createElement(View, {
    style: {
      marginTop: t.spacing.sectionGap,
      marginBottom: 6,
      borderBottomWidth: t.showRules ? 0.5 : 0,
      borderBottomColor: '#DDDDDD',
      paddingBottom: 3,
    },
  },
    React.createElement(Text, {
      style: {
        fontSize: t.fontSizes.sectionTitle,
        fontFamily: mapFont(t.fonts.heading),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: t.accent,
      },
    }, title),
  );
}

function SummarySection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (!data.professionalSummary) return null;
  return React.createElement(View, null,
    React.createElement(SectionTitle, { title: 'Professional Summary', style: t }),
    React.createElement(Text, {
      style: { fontSize: t.fontSizes.body, lineHeight: t.lineHeights.body / t.fontSizes.body, color: '#333333', fontFamily: mapFont(t.fonts.body) },
    }, data.professionalSummary),
  );
}

function ExperienceSection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (data.workExperience.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(SectionTitle, { title: 'Experience', style: t }),
    ...data.workExperience.map((job, i) =>
      React.createElement(View, { key: i, style: { marginBottom: t.spacing.itemGap } },
        // Title + dates row
        React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' } },
          React.createElement(Text, {
            style: { fontSize: t.fontSizes.jobTitle, fontFamily: mapFont(t.fonts.body), fontWeight: 'bold', color: '#1A1A1A' },
          }, job.jobTitle),
          React.createElement(Text, {
            style: { fontSize: t.fontSizes.small, color: '#666666', fontFamily: mapFont(t.fonts.body) },
          }, `${job.startDate} – ${job.endDate}`),
        ),
        // Company
        React.createElement(Text, {
          style: { fontSize: t.fontSizes.body, color: '#444444', fontFamily: mapFont(t.fonts.body), marginBottom: 3 },
        }, `${job.company}${job.location ? `, ${job.location}` : ''}`),
        // Bullets
        ...job.bullets.map((bullet, j) =>
          React.createElement(View, { key: j, style: { flexDirection: 'row', marginBottom: t.spacing.bulletGap, paddingLeft: 8 } },
            React.createElement(Text, { style: { fontSize: t.fontSizes.body, color: '#333333', marginRight: 6 } }, '\u2022'),
            React.createElement(Text, {
              style: { fontSize: t.fontSizes.body, lineHeight: t.lineHeights.body / t.fontSizes.body, color: '#333333', fontFamily: mapFont(t.fonts.body), flex: 1 },
            }, bullet),
          ),
        ),
      ),
    ),
  );
}

function EducationSection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (data.education.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(SectionTitle, { title: 'Education', style: t }),
    ...data.education.map((edu, i) =>
      React.createElement(View, { key: i, style: { marginBottom: t.spacing.itemGap } },
        React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' } },
          React.createElement(Text, {
            style: { fontSize: t.fontSizes.jobTitle, fontFamily: mapFont(t.fonts.body), fontWeight: 'bold', color: '#1A1A1A' },
          }, edu.degree),
          React.createElement(Text, {
            style: { fontSize: t.fontSizes.small, color: '#666666', fontFamily: mapFont(t.fonts.body) },
          }, edu.graduationDate),
        ),
        React.createElement(Text, {
          style: { fontSize: t.fontSizes.body, color: '#444444', fontFamily: mapFont(t.fonts.body) },
        }, `${edu.institution}${edu.location ? `, ${edu.location}` : ''}`),
        (edu.gpa || edu.honors) ? React.createElement(Text, {
          style: { fontSize: t.fontSizes.small, color: '#555555', fontFamily: mapFont(t.fonts.body), marginTop: 2 },
        }, [edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors ?? ''].filter(Boolean).join(' | ')) : null,
      ),
    ),
  );
}

function SkillsSection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (data.skills.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(SectionTitle, { title: 'Skills', style: t }),
    ...data.skills.map((group, i) =>
      React.createElement(View, { key: i, style: { flexDirection: 'row', marginBottom: t.spacing.bulletGap } },
        React.createElement(Text, {
          style: { fontSize: t.fontSizes.body, fontFamily: mapFont(t.fonts.body), fontWeight: 'bold', color: '#1A1A1A' },
        }, `${group.category}: `),
        React.createElement(Text, {
          style: { fontSize: t.fontSizes.body, fontFamily: mapFont(t.fonts.body), color: '#333333', flex: 1 },
        }, group.items.join(', ')),
      ),
    ),
  );
}

function CertificationsSection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (!data.certifications || data.certifications.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(SectionTitle, { title: 'Certifications', style: t }),
    ...data.certifications.map((cert, i) =>
      React.createElement(Text, {
        key: i,
        style: { fontSize: t.fontSizes.body, fontFamily: mapFont(t.fonts.body), color: '#333333', marginBottom: t.spacing.bulletGap },
      }, `${cert.name} – ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`),
    ),
  );
}

function AdditionalSection({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  if (!data.additionalSections || data.additionalSections.length === 0) return null;
  return React.createElement(View, null,
    ...data.additionalSections.map((section, i) =>
      React.createElement(View, { key: i },
        React.createElement(SectionTitle, { title: section.title, style: t }),
        React.createElement(Text, {
          style: { fontSize: t.fontSizes.body, lineHeight: t.lineHeights.body / t.fontSizes.body, color: '#333333', fontFamily: mapFont(t.fonts.body) },
        }, section.content),
      ),
    ),
  );
}

const sectionComponents: Record<SectionKey, React.FC<{ data: ResumeData; style: TemplateStyle }>> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  certifications: CertificationsSection,
  additional: AdditionalSection,
};

function ResumePdfDocument({ data, style: t }: { data: ResumeData; style: TemplateStyle }) {
  const { contactInfo } = data;
  const contact = contactParts(contactInfo);

  return React.createElement(Document, null,
    React.createElement(Page, {
      size: 'LETTER',
      style: {
        padding: t.spacing.pageMargin,
        fontFamily: mapFont(t.fonts.body),
        fontSize: t.fontSizes.body,
      },
    },
      // Name
      React.createElement(Text, {
        style: {
          fontSize: t.fontSizes.name,
          fontFamily: mapFont(t.fonts.heading),
          color: t.accent,
          textAlign: 'center',
          marginBottom: 4,
        },
      }, contactInfo.fullName || 'Your Name'),

      // Contact line
      React.createElement(Text, {
        style: {
          fontSize: t.fontSizes.small,
          color: '#555555',
          textAlign: 'center',
          marginBottom: t.spacing.sectionGap,
        },
      }, contact.join('  |  ')),

      // Top rule
      t.showRules ? React.createElement(View, {
        style: {
          borderBottomWidth: 0.5,
          borderBottomColor: t.accent,
          marginBottom: t.spacing.sectionGap,
        },
      }) : null,

      // Sections
      ...t.sectionOrder.map((key) => {
        const Component = sectionComponents[key];
        return React.createElement(Component, { key, data, style: t });
      }),
    ),
  );
}

export async function generatePdf(data: ResumeData, style: TemplateStyle): Promise<Buffer> {
  const element = React.createElement(ResumePdfDocument, { data, style });
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
