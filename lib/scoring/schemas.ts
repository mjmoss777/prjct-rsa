import { z } from 'zod';

export const sectionCompletenessSchema = z.object({
  score: z.number().min(0).max(100),
  foundSections: z.array(z.string()).describe('Section names found in the resume'),
  missingSections: z.array(z.string()).describe('Important sections missing from the resume'),
  nonStandardHeaders: z.array(z.string()).describe('Section headers that ATS may not recognize'),
  contactInfo: z.object({
    hasName: z.boolean(),
    hasEmail: z.boolean(),
    hasPhone: z.boolean(),
    hasLinkedIn: z.boolean(),
  }),
  feedback: z.array(z.string()).describe('Specific actionable feedback for section improvements'),
});

export const hardSkillsMatchSchema = z.object({
  score: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()).describe('Skills found in both resume and job description'),
  missingSkills: z.array(z.string()).describe('Skills in the JD but missing from the resume'),
  synonymMatches: z.array(z.object({
    resume: z.string().describe('Term used in the resume'),
    jd: z.string().describe('Equivalent term in the job description'),
  })).describe('Skills that match via synonym or abbreviation'),
  keywordDensity: z.array(z.object({
    keyword: z.string(),
    count: z.number().describe('Number of times this keyword appears in the resume'),
  })).describe('Frequency of key terms from the JD in the resume'),
  feedback: z.array(z.string()),
});

export const contentQualitySchema = z.object({
  score: z.number().min(0).max(100),
  actionVerbUsage: z.object({
    good: z.array(z.string()).describe('Strong action verbs found at bullet starts'),
    weak: z.array(z.string()).describe('Weak or passive phrasing found at bullet starts'),
  }),
  quantifiedAchievements: z.array(z.object({
    bullet: z.string().describe('The bullet point text'),
    metric: z.string().describe('The quantified result or metric'),
  })).describe('Bullets that contain measurable outcomes'),
  bulletLengthIssues: z.array(z.object({
    bullet: z.string(),
    issue: z.string().describe('Too long, too short, or other length issue'),
  })),
  fillerLanguage: z.array(z.string()).describe('Filler phrases or cliches found in the resume'),
  feedback: z.array(z.string()),
});

export const jobTitleAlignmentSchema = z.object({
  score: z.number().min(0).max(100),
  targetTitle: z.string().describe('The job title from the job description'),
  resumeTitles: z.array(z.string()).describe('Job titles found in the resume'),
  alignmentLevel: z.enum(['exact', 'strong', 'moderate', 'weak']).describe('How closely resume titles match the target'),
  feedback: z.array(z.string()),
});

export const experienceDepthSchema = z.object({
  score: z.number().min(0).max(100),
  totalYears: z.number().describe('Total years of work experience'),
  relevantYears: z.number().describe('Years of experience relevant to this JD'),
  positions: z.array(z.object({
    title: z.string(),
    company: z.string(),
    years: z.number().describe('Duration in years'),
  })),
  feedback: z.array(z.string()),
});

export const softSkillsSchema = z.object({
  score: z.number().min(0).max(100),
  identifiedSkills: z.array(z.string()).describe('Soft skills demonstrated in context'),
  contextualEvidence: z.array(z.object({
    skill: z.string(),
    evidence: z.string().describe('Quote or paraphrase from the resume showing this skill'),
  })),
  feedback: z.array(z.string()),
});

export const educationMatchSchema = z.object({
  score: z.number().min(0).max(100),
  requiredDegree: z.string().describe('Degree level required by the JD, or "none" if not specified'),
  foundDegrees: z.array(z.string()).describe('Degrees found in the resume'),
  certifications: z.array(z.string()).describe('Certifications found in the resume'),
  isMatch: z.boolean().describe('Whether education meets the JD requirements'),
  feedback: z.array(z.string()),
});

export const fullAnalysisSchema = z.object({
  sectionCompleteness: sectionCompletenessSchema,
  hardSkillsMatch: hardSkillsMatchSchema,
  contentQuality: contentQualitySchema,
  jobTitleAlignment: jobTitleAlignmentSchema,
  experienceDepth: experienceDepthSchema,
  softSkills: softSkillsSchema,
  educationMatch: educationMatchSchema,
  summary: z.string().describe('2-3 sentence overall assessment of the resume against this JD'),
  topRecommendations: z.array(z.string()).max(5).describe('Top 5 most impactful changes the candidate should make'),
});

export type FullAnalysisResult = z.infer<typeof fullAnalysisSchema>;
