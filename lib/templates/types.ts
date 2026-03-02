import type { TemplateType } from '@/config/db/schema/ats-schema';

export type TemplateStyle = {
  id: TemplateType;
  name: string;
  description: string;
  fonts: {
    heading: string;
    body: string;
  };
  fontSizes: {
    name: number;
    sectionTitle: number;
    jobTitle: number;
    body: number;
    small: number;
  };
  lineHeights: {
    name: number;
    sectionTitle: number;
    body: number;
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    bulletGap: number;
    pageMargin: number;
  };
  accent: string;
  showRules: boolean;
  sectionOrder: SectionKey[];
};

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'additional';
