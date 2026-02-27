'use client';

import { cn } from '@/lib/utils';

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-accent', stroke: 'stroke-accent' };
  if (score >= 60) return { text: 'text-muted', stroke: 'stroke-muted' };
  return { text: 'text-error', stroke: 'stroke-error' };
}

export function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={10}
          className="stroke-border"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors.stroke, 'transition-all duration-700')}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="36"
          className={cn('fill-current font-display', colors.text)}
          style={{ fontWeight: 400 }}
        >
          {score}
        </text>
      </svg>
      <span className="font-body text-[13px] leading-[16px] text-subtle">
        Overall ATS Score
      </span>
    </div>
  );
}
