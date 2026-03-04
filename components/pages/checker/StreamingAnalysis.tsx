'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { CATEGORY_WEIGHTS } from '@/lib/scoring/constants';
import type { FullAnalysisResult } from '@/lib/scoring/schemas';
import type { DeepPartial } from 'ai';

type ParseabilityData = {
  score: number;
  weight: number;
  feedback: string[];
};

type Props = {
  object: DeepPartial<FullAnalysisResult> | undefined;
  isLoading: boolean;
  error: Error | undefined;
  parseability: ParseabilityData;
};

function isCategoryReady(
  cat: DeepPartial<{ score?: number; feedback?: string[] }> | undefined,
): cat is { score: number; feedback: string[] } {
  return !!cat && typeof cat.score === 'number' && Array.isArray(cat.feedback);
}

function computeProjectedScore(
  object: DeepPartial<FullAnalysisResult> | undefined,
  parseability: ParseabilityData,
): number {
  let totalWeight = CATEGORY_WEIGHTS.parseability;
  let weightedSum = parseability.score * CATEGORY_WEIGHTS.parseability;

  const categories = [
    { data: object?.sectionCompleteness, weight: CATEGORY_WEIGHTS.sectionCompleteness },
    { data: object?.hardSkillsMatch, weight: CATEGORY_WEIGHTS.hardSkillsMatch },
    { data: object?.contentQuality, weight: CATEGORY_WEIGHTS.contentQuality },
    { data: object?.jobTitleAlignment, weight: CATEGORY_WEIGHTS.jobTitleAlignment },
    { data: object?.experienceDepth, weight: CATEGORY_WEIGHTS.experienceDepth },
    { data: object?.softSkills, weight: CATEGORY_WEIGHTS.softSkills },
    { data: object?.educationMatch, weight: CATEGORY_WEIGHTS.educationMatch },
  ];

  for (const { data, weight } of categories) {
    if (isCategoryReady(data)) {
      weightedSum += data.score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * (1 / totalWeight) * 100) : 0;
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export function StreamingAnalysis({ object, isLoading, error, parseability }: Props) {
  // Compute a running projected score
  let projectedScore = parseability.score * CATEGORY_WEIGHTS.parseability;
  const readyCategories: { score: number; weight: number }[] = [];

  const catEntries = [
    { data: object?.sectionCompleteness, weight: CATEGORY_WEIGHTS.sectionCompleteness },
    { data: object?.hardSkillsMatch, weight: CATEGORY_WEIGHTS.hardSkillsMatch },
    { data: object?.contentQuality, weight: CATEGORY_WEIGHTS.contentQuality },
    { data: object?.jobTitleAlignment, weight: CATEGORY_WEIGHTS.jobTitleAlignment },
    { data: object?.experienceDepth, weight: CATEGORY_WEIGHTS.experienceDepth },
    { data: object?.softSkills, weight: CATEGORY_WEIGHTS.softSkills },
    { data: object?.educationMatch, weight: CATEGORY_WEIGHTS.educationMatch },
  ];

  for (const { data, weight } of catEntries) {
    if (isCategoryReady(data)) {
      projectedScore += data.score * weight;
      readyCategories.push({ score: data.score, weight });
    }
  }

  const displayScore = Math.round(projectedScore);

  return (
    <div className="flex flex-col gap-8">
      {/* Score gauge */}
      <div className="flex flex-col items-center gap-4">
        <ScoreGauge score={displayScore} />
        {isLoading && (
          <p className="animate-pulse font-body text-[13px] leading-[16px] text-subtle">
            Analyzing your resume...
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-[var(--radius-card)] border border-error/20 bg-error/5 p-4">
          <p className="m-0 font-body text-[15px] leading-[24px] text-error">
            Analysis failed. Please try again.
          </p>
        </div>
      )}

      {/* Category cards */}
      <AnimatePresence mode="popLayout">
        {/* Parseability — always shown immediately */}
        <motion.div key="parseability" {...fadeIn}>
          <ScoreCard
            label="Parseability"
            score={parseability.score}
            weight={parseability.weight}
            feedback={parseability.feedback}
          />
        </motion.div>

        {isCategoryReady(object?.hardSkillsMatch) && (
          <motion.div key="hard-skills" {...fadeIn}>
            <ScoreCard
              label="Hard Skills Match"
              score={object!.hardSkillsMatch!.score!}
              weight={CATEGORY_WEIGHTS.hardSkillsMatch}
              feedback={object!.hardSkillsMatch!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.sectionCompleteness) && (
          <motion.div key="section-completeness" {...fadeIn}>
            <ScoreCard
              label="Section Completeness"
              score={object!.sectionCompleteness!.score!}
              weight={CATEGORY_WEIGHTS.sectionCompleteness}
              feedback={object!.sectionCompleteness!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.contentQuality) && (
          <motion.div key="content-quality" {...fadeIn}>
            <ScoreCard
              label="Content Quality"
              score={object!.contentQuality!.score!}
              weight={CATEGORY_WEIGHTS.contentQuality}
              feedback={object!.contentQuality!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.jobTitleAlignment) && (
          <motion.div key="job-title" {...fadeIn}>
            <ScoreCard
              label="Job Title Alignment"
              score={object!.jobTitleAlignment!.score!}
              weight={CATEGORY_WEIGHTS.jobTitleAlignment}
              feedback={object!.jobTitleAlignment!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.experienceDepth) && (
          <motion.div key="experience" {...fadeIn}>
            <ScoreCard
              label="Experience Depth"
              score={object!.experienceDepth!.score!}
              weight={CATEGORY_WEIGHTS.experienceDepth}
              feedback={object!.experienceDepth!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.softSkills) && (
          <motion.div key="soft-skills" {...fadeIn}>
            <ScoreCard
              label="Soft Skills"
              score={object!.softSkills!.score!}
              weight={CATEGORY_WEIGHTS.softSkills}
              feedback={object!.softSkills!.feedback as string[]}
            />
          </motion.div>
        )}

        {isCategoryReady(object?.educationMatch) && (
          <motion.div key="education" {...fadeIn}>
            <ScoreCard
              label="Education Match"
              score={object!.educationMatch!.score!}
              weight={CATEGORY_WEIGHTS.educationMatch}
              feedback={object!.educationMatch!.feedback as string[]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary + recommendations — appear at end */}
      {object?.summary && !isLoading && (
        <motion.div {...fadeIn} className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
          <h2 className="mb-3 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
            Summary
          </h2>
          <p className="m-0 font-body text-[15px] leading-[24px] text-muted">
            {object.summary}
          </p>
        </motion.div>
      )}

      {object?.topRecommendations && !isLoading && (object.topRecommendations as string[]).length > 0 && (
        <motion.div {...fadeIn} className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
            Top Recommendations
          </h2>
          <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-5">
            {(object.topRecommendations as string[]).map((rec, i) => (
              <li key={i} className="font-body text-[15px] leading-[24px] text-muted">
                {rec}
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}
