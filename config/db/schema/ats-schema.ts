import { pgTable, serial, text, real, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export type ResumeData = {
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedIn?: string;
    location?: string;
    website?: string;
  };
  professionalSummary: string;
  workExperience: {
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
    honors?: string;
  }[];
  skills: { category: string; items: string[] }[];
  certifications?: { name: string; issuer: string; date?: string }[];
  additionalSections?: { title: string; content: string }[];
};

export type TemplateType =
  // General
  | 'reverse-chronological' | 'hybrid' | 'minimalist' | 'professional' | 'modern'
  // ATS-Optimized
  | 'executive' | 'technical' | 'creative-ats' | 'federal' | 'academic' | 'compact'
  // Industry-Focused
  | 'tech-industry' | 'finance' | 'healthcare' | 'legal' | 'marketing';

type BaseScore = {
  score: number;
  weight: number;
  feedback: string[];
};

type ParseabilityScoreData = BaseScore & {
  fileFormatQuality: string;
  fontSafety: string[];
  layoutSafety: string;
  headerFooterIssues: string[];
  graphicElements: string[];
};

type SectionCompletenessScoreData = BaseScore & {
  foundSections: string[];
  missingSections: string[];
  nonStandardHeaders: string[];
  contactInfo: Record<string, boolean>;
};

type HardSkillsScoreData = BaseScore & {
  matchedSkills: string[];
  missingSkills: string[];
  synonymMatches: { resume: string; jd: string }[];
  keywordDensity: { keyword: string; count: number }[];
};

type ContentQualityScoreData = BaseScore & {
  actionVerbUsage: { good: string[]; weak: string[] };
  quantifiedAchievements: { bullet: string; metric: string }[];
  bulletLengthIssues: { bullet: string; issue: string }[];
  fillerLanguage: string[];
};

type JobTitleAlignmentScoreData = BaseScore & {
  targetTitle: string;
  resumeTitles: string[];
  alignmentLevel: 'exact' | 'strong' | 'moderate' | 'weak';
};

type ExperienceDepthScoreData = BaseScore & {
  totalYears: number;
  relevantYears: number;
  positions: { title: string; company: string; years: number }[];
};

type SoftSkillsScoreData = BaseScore & {
  identifiedSkills: string[];
  contextualEvidence: { skill: string; evidence: string }[];
};

type EducationMatchScoreData = BaseScore & {
  requiredDegree: string;
  foundDegrees: string[];
  certifications: string[];
  isMatch: boolean;
};

export type ScanStatus = 'pending' | 'analyzing' | 'complete' | 'failed';

export const resumeScan = pgTable('resume_scan', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  extractedText: text('extracted_text').notNull(),
  fileUrl: text('file_url'),
  jobDescription: text('job_description'),
  jobTitle: text('job_title'),
  status: text('status').$type<ScanStatus>().notNull().default('pending'),
  overallScore: real('overall_score'),
  parseabilityScore: jsonb('parseability_score').$type<ParseabilityScoreData>().notNull(),
  sectionCompletenessScore: jsonb('section_completeness_score').$type<SectionCompletenessScoreData>(),
  hardSkillsScore: jsonb('hard_skills_score').$type<HardSkillsScoreData>(),
  contentQualityScore: jsonb('content_quality_score').$type<ContentQualityScoreData>(),
  jobTitleAlignmentScore: jsonb('job_title_alignment_score').$type<JobTitleAlignmentScoreData>(),
  experienceDepthScore: jsonb('experience_depth_score').$type<ExperienceDepthScoreData>(),
  softSkillsScore: jsonb('soft_skills_score').$type<SoftSkillsScoreData>(),
  educationMatchScore: jsonb('education_match_score').$type<EducationMatchScoreData>(),
  summary: text('summary'),
  topRecommendations: jsonb('top_recommendations').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const savedResume = pgTable('saved_resume', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  templateType: text('template_type').$type<TemplateType>().notNull().default('reverse-chronological'),
  resumeData: jsonb('resume_data').$type<ResumeData>().notNull(),
  lastScanId: integer('last_scan_id').references(() => resumeScan.id, { onDelete: 'set null' }),
  lastScanScore: real('last_scan_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
