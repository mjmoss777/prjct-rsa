import { generateObject } from 'ai';
import { getModel } from '@/config/ai';
import { fullAnalysisSchema, type FullAnalysisResult } from './schemas';
import { SCORING_SYSTEM_PROMPT, buildAnalysisPrompt } from './prompts';

export type AiScoringResult = FullAnalysisResult & {
  weights: {
    sectionCompleteness: number;
    hardSkillsMatch: number;
    contentQuality: number;
    jobTitleAlignment: number;
    experienceDepth: number;
    softSkills: number;
    educationMatch: number;
  };
};

const CATEGORY_WEIGHTS = {
  sectionCompleteness: 0.10,
  hardSkillsMatch: 0.325,
  contentQuality: 0.10,
  jobTitleAlignment: 0.125,
  experienceDepth: 0.125,
  softSkills: 0.075,
  educationMatch: 0.05,
} as const;

export async function scoreWithAi(
  resumeText: string,
  jobDescription: string,
): Promise<AiScoringResult> {
  const { object } = await generateObject({
    model: getModel(),
    mode: 'tool',
    schema: fullAnalysisSchema,
    system: SCORING_SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(resumeText, jobDescription),
  });

  return {
    ...object,
    weights: CATEGORY_WEIGHTS,
  };
}

export { CATEGORY_WEIGHTS };
