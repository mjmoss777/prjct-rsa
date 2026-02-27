'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-accent';
  if (score >= 60) return 'bg-muted';
  return 'bg-error';
}

type ScoreCardProps = {
  label: string;
  score: number;
  weight: number;
  feedback: string[];
  children?: React.ReactNode;
};

export function ScoreCard({ label, score, weight, feedback, children }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const weightPct = Math.round(weight * 100);

  return (
    <div className="flex w-full flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-body text-[15px] font-medium leading-[24px] text-fg">
            {label}
          </span>
          <span className="font-body text-[13px] leading-[16px] text-subtle">
            {weightPct}% weight
          </span>
        </div>
        <span className={cn(
          'font-display text-[22px] leading-[28px] tracking-[-0.01em]',
          score >= 80 ? 'text-accent' : score >= 60 ? 'text-muted' : 'text-error',
        )}>
          {score}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-border">
        <div
          className={cn('h-full rounded-pill transition-all duration-500', getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Extra detail content */}
      {children}

      {/* Expandable feedback */}
      {feedback.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="self-start bg-transparent p-0 font-body text-[13px] leading-[16px] text-accent [touch-action:manipulation]"
          >
            {expanded ? 'Hide feedback' : `View feedback (${feedback.length})`}
          </button>
          {expanded && (
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              {feedback.map((item, i) => (
                <li key={i} className="font-body text-[15px] leading-[24px] text-muted">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
