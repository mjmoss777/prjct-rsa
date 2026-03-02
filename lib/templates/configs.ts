import type { TemplateStyle } from './types';

const DEFAULT_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'experience', 'education', 'skills', 'certifications', 'additional',
];

const HYBRID_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'skills', 'experience', 'education', 'certifications', 'additional',
];

export const templates: Record<string, TemplateStyle> = {
  'reverse-chronological': {
    id: 'reverse-chronological',
    name: 'Classic',
    description: 'Standard reverse-chronological format. Clean and widely accepted.',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 22, sectionTitle: 14, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 18, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#2B2B2B',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  hybrid: {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Skills-first layout. Ideal for career changers or skill-heavy roles.',
    fonts: { heading: 'Arial', body: 'Arial' },
    fontSizes: { name: 20, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 26, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 14, itemGap: 8, bulletGap: 3, pageMargin: 48 },
    accent: '#2B2B2B',
    showRules: true,
    sectionOrder: HYBRID_ORDER,
  },

  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Maximum whitespace and minimal decoration. Lets content speak.',
    fonts: { heading: 'Georgia', body: 'Georgia' },
    fontSizes: { name: 24, sectionTitle: 12, jobTitle: 11, body: 11, small: 10 },
    lineHeights: { name: 30, sectionTitle: 16, body: 17 },
    spacing: { sectionGap: 20, itemGap: 12, bulletGap: 4, pageMargin: 56 },
    accent: '#444444',
    showRules: false,
    sectionOrder: DEFAULT_ORDER,
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional with subtle accent color and horizontal rules.',
    fonts: { heading: 'Times New Roman', body: 'Times New Roman' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#1a3a5c',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Typography-forward with weight contrast. ATS-safe visual enhancements.',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 26, sectionTitle: 12, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 32, sectionTitle: 16, body: 16 },
    spacing: { sectionGap: 18, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#2d5a3d',
    showRules: false,
    sectionOrder: DEFAULT_ORDER,
  },
};

export function getTemplate(id: string): TemplateStyle {
  return templates[id] ?? templates['reverse-chronological'];
}

export const templateList = Object.values(templates);
