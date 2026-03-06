import type { TemplateStyle } from './types';

const DEFAULT_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'experience', 'education', 'skills', 'certifications', 'additional',
];

const HYBRID_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'skills', 'experience', 'education', 'certifications', 'additional',
];

const ACADEMIC_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'education', 'experience', 'skills', 'certifications', 'additional',
];

const FEDERAL_ORDER: TemplateStyle['sectionOrder'] = [
  'summary', 'experience', 'skills', 'education', 'certifications', 'additional',
];

export const templates: Record<string, TemplateStyle> = {
  // ── General ────────────────────────────────────────────────
  'reverse-chronological': {
    id: 'reverse-chronological',
    name: 'Classic',
    description: 'Standard reverse-chronological format. Clean and widely accepted.',
    category: 'general',
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
    category: 'general',
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
    category: 'general',
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
    category: 'general',
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
    category: 'general',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 26, sectionTitle: 12, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 32, sectionTitle: 16, body: 16 },
    spacing: { sectionGap: 18, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#2d5a3d',
    showRules: false,
    sectionOrder: DEFAULT_ORDER,
  },

  // ── ATS-Optimized ─────────────────────────────────────────
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Generous margins and large name. Ideal for senior leadership roles.',
    category: 'ats-optimized',
    fonts: { heading: 'Georgia', body: 'Cambria' },
    fontSizes: { name: 28, sectionTitle: 14, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 34, sectionTitle: 18, body: 17 },
    spacing: { sectionGap: 20, itemGap: 12, bulletGap: 5, pageMargin: 56 },
    accent: '#1a1a2e',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Skills-first, compact spacing. Built for engineering and IT roles.',
    category: 'ats-optimized',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 20, sectionTitle: 13, jobTitle: 11, body: 10.5, small: 9.5 },
    lineHeights: { name: 26, sectionTitle: 17, body: 15 },
    spacing: { sectionGap: 12, itemGap: 7, bulletGap: 3, pageMargin: 44 },
    accent: '#2d3436',
    showRules: true,
    sectionOrder: HYBRID_ORDER,
  },

  'creative-ats': {
    id: 'creative-ats',
    name: 'Creative ATS',
    description: 'Warm accent with weight contrast. ATS-safe with a touch of personality.',
    category: 'ats-optimized',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 24, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 30, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 18, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#8b5e3c',
    showRules: false,
    sectionOrder: DEFAULT_ORDER,
  },

  federal: {
    id: 'federal',
    name: 'Federal',
    description: 'Expanded detail sections for government and public sector applications.',
    category: 'ats-optimized',
    fonts: { heading: 'Times New Roman', body: 'Times New Roman' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#1a1a1a',
    showRules: true,
    sectionOrder: FEDERAL_ORDER,
  },

  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Education-first layout. Designed for research and academic positions.',
    category: 'ats-optimized',
    fonts: { heading: 'Georgia', body: 'Georgia' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 17 },
    spacing: { sectionGap: 18, itemGap: 10, bulletGap: 4, pageMargin: 52 },
    accent: '#2c3e50',
    showRules: true,
    sectionOrder: ACADEMIC_ORDER,
  },

  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Maximum content density. Fits more on one page without sacrificing readability.',
    category: 'ats-optimized',
    fonts: { heading: 'Arial', body: 'Arial' },
    fontSizes: { name: 18, sectionTitle: 12, jobTitle: 11, body: 10, small: 9 },
    lineHeights: { name: 24, sectionTitle: 16, body: 14 },
    spacing: { sectionGap: 10, itemGap: 6, bulletGap: 2, pageMargin: 40 },
    accent: '#333333',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  // ── Industry-Focused ──────────────────────────────────────
  'tech-industry': {
    id: 'tech-industry',
    name: 'Tech Industry',
    description: 'Skills prominent with blue accent. Project-friendly for tech roles.',
    category: 'industry-focused',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#0066cc',
    showRules: false,
    sectionOrder: HYBRID_ORDER,
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Conservative and formal. Trusted by banking and finance professionals.',
    category: 'industry-focused',
    fonts: { heading: 'Times New Roman', body: 'Times New Roman' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#1a3a5c',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Clean layout with certification emphasis for medical professionals.',
    category: 'industry-focused',
    fonts: { heading: 'Arial', body: 'Arial' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#2d6a4f',
    showRules: true,
    sectionOrder: DEFAULT_ORDER,
  },

  legal: {
    id: 'legal',
    name: 'Legal',
    description: 'Formal serif typography. Education-first for law professionals.',
    category: 'industry-focused',
    fonts: { heading: 'Georgia', body: 'Georgia' },
    fontSizes: { name: 22, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 28, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 52 },
    accent: '#2c1810',
    showRules: true,
    sectionOrder: ACADEMIC_ORDER,
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Results-driven with a bold accent. Metrics-forward for marketing roles.',
    category: 'industry-focused',
    fonts: { heading: 'Calibri', body: 'Calibri' },
    fontSizes: { name: 24, sectionTitle: 13, jobTitle: 12, body: 11, small: 10 },
    lineHeights: { name: 30, sectionTitle: 17, body: 16 },
    spacing: { sectionGap: 16, itemGap: 10, bulletGap: 4, pageMargin: 48 },
    accent: '#c44536',
    showRules: false,
    sectionOrder: DEFAULT_ORDER,
  },
};

export function getTemplate(id: string): TemplateStyle {
  return templates[id] ?? templates['reverse-chronological'];
}

export const templateList = Object.values(templates);
