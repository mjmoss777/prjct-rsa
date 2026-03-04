import type { ParsedResume } from '@/lib/parsers';
import { scoreParseability, type ParseabilityScore } from './parseability-scorer';
import { scoreWithAi, type AiScoringResult } from './ai-scorer';
import { CATEGORY_WEIGHTS } from './constants';

export type CompositeScore = {
  overallScore: number;
  parseability: ParseabilityScore;
  sectionCompleteness: AiScoringResult['sectionCompleteness'] & { weight: number };
  hardSkillsMatch: AiScoringResult['hardSkillsMatch'] & { weight: number };
  contentQuality: AiScoringResult['contentQuality'] & { weight: number };
  jobTitleAlignment: AiScoringResult['jobTitleAlignment'] & { weight: number };
  experienceDepth: AiScoringResult['experienceDepth'] & { weight: number };
  softSkills: AiScoringResult['softSkills'] & { weight: number };
  educationMatch: AiScoringResult['educationMatch'] & { weight: number };
  summary: string;
  topRecommendations: string[];
};

export async function scoreResume(
  parsed: ParsedResume,
  jobDescription: string,
): Promise<CompositeScore> {
  const [parseability, aiResult] = await Promise.all([
    scoreParseability(parsed),
    scoreWithAi(parsed.text, jobDescription),
  ]);

  const weightedSum =
    parseability.score * CATEGORY_WEIGHTS.parseability +
    aiResult.sectionCompleteness.score * CATEGORY_WEIGHTS.sectionCompleteness +
    aiResult.hardSkillsMatch.score * CATEGORY_WEIGHTS.hardSkillsMatch +
    aiResult.contentQuality.score * CATEGORY_WEIGHTS.contentQuality +
    aiResult.jobTitleAlignment.score * CATEGORY_WEIGHTS.jobTitleAlignment +
    aiResult.experienceDepth.score * CATEGORY_WEIGHTS.experienceDepth +
    aiResult.softSkills.score * CATEGORY_WEIGHTS.softSkills +
    aiResult.educationMatch.score * CATEGORY_WEIGHTS.educationMatch;

  const overallScore = Math.round(weightedSum);

  return {
    overallScore,
    parseability,
    sectionCompleteness: { ...aiResult.sectionCompleteness, weight: CATEGORY_WEIGHTS.sectionCompleteness },
    hardSkillsMatch: { ...aiResult.hardSkillsMatch, weight: CATEGORY_WEIGHTS.hardSkillsMatch },
    contentQuality: { ...aiResult.contentQuality, weight: CATEGORY_WEIGHTS.contentQuality },
    jobTitleAlignment: { ...aiResult.jobTitleAlignment, weight: CATEGORY_WEIGHTS.jobTitleAlignment },
    experienceDepth: { ...aiResult.experienceDepth, weight: CATEGORY_WEIGHTS.experienceDepth },
    softSkills: { ...aiResult.softSkills, weight: CATEGORY_WEIGHTS.softSkills },
    educationMatch: { ...aiResult.educationMatch, weight: CATEGORY_WEIGHTS.educationMatch },
    summary: aiResult.summary,
    topRecommendations: aiResult.topRecommendations,
  };
}
