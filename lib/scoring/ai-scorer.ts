import { generateObject } from 'ai';
import { getModel } from '@/config/ai';
import { fullAnalysisSchema, type FullAnalysisResult } from './schemas';
import { SCORING_SYSTEM_PROMPT, buildAnalysisPrompt } from './prompts';
import { CATEGORY_WEIGHTS } from './constants';

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

export async function scoreWithAi(
  resumeText: string,
  jobDescription: string,
): Promise<AiScoringResult> {
  const { object } = await generateObject({
    model: getModel(),
    schema: fullAnalysisSchema,
    system: SCORING_SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(resumeText, jobDescription),
  });

  return {
    ...object,
    weights: {
      sectionCompleteness: CATEGORY_WEIGHTS.sectionCompleteness,
      hardSkillsMatch: CATEGORY_WEIGHTS.hardSkillsMatch,
      contentQuality: CATEGORY_WEIGHTS.contentQuality,
      jobTitleAlignment: CATEGORY_WEIGHTS.jobTitleAlignment,
      experienceDepth: CATEGORY_WEIGHTS.experienceDepth,
      softSkills: CATEGORY_WEIGHTS.softSkills,
      educationMatch: CATEGORY_WEIGHTS.educationMatch,
    },
  };
}
