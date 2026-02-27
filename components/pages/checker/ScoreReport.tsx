'use client';

import { cn } from '@/lib/utils';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { ScoreCard } from '@/components/ui/ScoreCard';
import type { resumeScan } from '@/config/db/schema/ats-schema';

type Scan = typeof resumeScan.$inferSelect;

function alignmentColor(level: string): string {
  switch (level) {
    case 'exact': return 'text-accent';
    case 'strong': return 'text-accent-soft';
    case 'moderate': return 'text-muted';
    default: return 'text-error';
  }
}

function alignmentDot(level: string): string {
  switch (level) {
    case 'exact': return 'bg-accent';
    case 'strong': return 'bg-accent-soft';
    case 'moderate': return 'bg-muted';
    default: return 'bg-error';
  }
}

function Tag({ children, variant }: { children: React.ReactNode; variant: 'accent' | 'accent-soft' | 'muted' | 'error' }) {
  const colorMap = {
    accent: { text: 'text-accent', dot: 'bg-accent' },
    'accent-soft': { text: 'text-accent-soft', dot: 'bg-accent-soft' },
    muted: { text: 'text-muted', dot: 'bg-muted' },
    error: { text: 'text-error', dot: 'bg-error' },
  };
  const c = colorMap[variant];

  return (
    <span className={cn(
      'inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1 font-body text-[13px] font-medium uppercase leading-[16px] tracking-[0.04em]',
      c.text,
    )}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', c.dot)} />
      {children}
    </span>
  );
}

function tagVariant(level: string): 'accent' | 'accent-soft' | 'muted' | 'error' {
  switch (level) {
    case 'exact': return 'accent';
    case 'strong': return 'accent-soft';
    case 'moderate': return 'muted';
    default: return 'error';
  }
}

function SkillChip({ children, variant }: { children: React.ReactNode; variant: 'match' | 'missing' }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-pill border px-3 py-1 font-body text-[13px] leading-[16px]',
      variant === 'match'
        ? 'border-accent/20 bg-accent/5 text-accent'
        : 'border-error/20 bg-error/5 text-error',
    )}>
      {children}
    </span>
  );
}

export function ScoreReport({ scan }: { scan: Scan }) {
  const {
    overallScore,
    parseabilityScore,
    sectionCompletenessScore,
    hardSkillsScore,
    contentQualityScore,
    jobTitleAlignmentScore,
    experienceDepthScore,
    softSkillsScore,
    educationMatchScore,
    summary,
    topRecommendations,
  } = scan;

  return (
    <div className="flex flex-col gap-20">
      {/* Header */}
      <div className="flex flex-col items-center gap-8">
        <ScoreGauge score={overallScore} />
        <div className="max-w-[600px] text-center">
          <h1 className="m-0 font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg [text-wrap:balance]">
            Scan Results
          </h1>
          <p className="mt-1 font-body text-[13px] leading-[16px] text-subtle">
            {scan.fileName}
          </p>
          <p className="mt-3 font-body text-[15px] leading-[24px] text-muted">
            {summary}
          </p>
        </div>
      </div>

      {/* Top Recommendations */}
      {topRecommendations.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
            Top Recommendations
          </h2>
          <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-5">
            {topRecommendations.map((rec, i) => (
              <li key={i} className="font-body text-[15px] leading-[24px] text-muted">
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Category Scores */}
      <div className="flex flex-col gap-4">
        <h2 className="m-0 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
          Score Breakdown
        </h2>

        <ScoreCard
          label="Hard Skills Match"
          score={hardSkillsScore.score}
          weight={hardSkillsScore.weight}
          feedback={hardSkillsScore.feedback}
        >
          {hardSkillsScore.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hardSkillsScore.matchedSkills.map((skill) => (
                <SkillChip key={skill} variant="match">{skill}</SkillChip>
              ))}
            </div>
          )}
          {hardSkillsScore.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hardSkillsScore.missingSkills.map((skill) => (
                <SkillChip key={skill} variant="missing">{skill}</SkillChip>
              ))}
            </div>
          )}
        </ScoreCard>

        <ScoreCard
          label="Parseability"
          score={parseabilityScore.score}
          weight={parseabilityScore.weight}
          feedback={parseabilityScore.feedback}
        />

        <ScoreCard
          label="Section Completeness"
          score={sectionCompletenessScore.score}
          weight={sectionCompletenessScore.weight}
          feedback={sectionCompletenessScore.feedback}
        />

        <ScoreCard
          label="Content Quality"
          score={contentQualityScore.score}
          weight={contentQualityScore.weight}
          feedback={contentQualityScore.feedback}
        />

        <ScoreCard
          label="Job Title Alignment"
          score={jobTitleAlignmentScore.score}
          weight={jobTitleAlignmentScore.weight}
          feedback={jobTitleAlignmentScore.feedback}
        >
          <div className="flex items-center gap-2">
            <span className="font-body text-[13px] leading-[16px] text-subtle">
              Target:
            </span>
            <span className="font-body text-[15px] font-medium leading-[24px] text-fg">
              {jobTitleAlignmentScore.targetTitle}
            </span>
            <Tag variant={tagVariant(jobTitleAlignmentScore.alignmentLevel)}>
              {jobTitleAlignmentScore.alignmentLevel}
            </Tag>
          </div>
        </ScoreCard>

        <ScoreCard
          label="Experience Depth"
          score={experienceDepthScore.score}
          weight={experienceDepthScore.weight}
          feedback={experienceDepthScore.feedback}
        >
          <p className="m-0 font-body text-[13px] leading-[16px] text-subtle">
            {experienceDepthScore.totalYears} years total, {experienceDepthScore.relevantYears} relevant
          </p>
        </ScoreCard>

        <ScoreCard
          label="Soft Skills"
          score={softSkillsScore.score}
          weight={softSkillsScore.weight}
          feedback={softSkillsScore.feedback}
        />

        <ScoreCard
          label="Education Match"
          score={educationMatchScore.score}
          weight={educationMatchScore.weight}
          feedback={educationMatchScore.feedback}
        >
          <div className="flex items-center gap-2">
            <span className="font-body text-[13px] leading-[16px] text-subtle">
              Required:
            </span>
            <span className="font-body text-[15px] leading-[24px] text-fg">
              {educationMatchScore.requiredDegree}
            </span>
            <Tag variant={educationMatchScore.isMatch ? 'accent' : 'error'}>
              {educationMatchScore.isMatch ? 'Match' : 'Mismatch'}
            </Tag>
          </div>
        </ScoreCard>
      </div>
    </div>
  );
}
