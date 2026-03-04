'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type ScanRow = {
  id: number;
  fileName: string;
  overallScore: number | null;
  status: string;
  createdAt: Date;
};

function scoreColor(score: number | null): string {
  if (score === null) return 'text-subtle';
  if (score >= 80) return 'text-accent';
  if (score >= 60) return 'text-muted';
  return 'text-error';
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    complete: { bg: 'bg-accent/10', text: 'text-accent' },
    analyzing: { bg: 'bg-muted/10', text: 'text-muted' },
    pending: { bg: 'bg-subtle/10', text: 'text-subtle' },
    failed: { bg: 'bg-error/10', text: 'text-error' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={cn('inline-flex rounded-pill px-2.5 py-0.5 font-body text-[13px] leading-[16px] font-medium capitalize', s.bg, s.text)}>
      {status}
    </span>
  );
}

export function ScanHistoryTable({ scans }: { scans: ScanRow[] }) {
  if (scans.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface px-6 py-10 text-center">
        <p className="m-0 font-body text-[15px] leading-[24px] text-muted">
          No scans yet. Upload a resume to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-hover-tint">
            <th className="px-5 py-3 text-left font-body text-[13px] font-medium leading-[16px] text-subtle">
              File
            </th>
            <th className="px-5 py-3 text-left font-body text-[13px] font-medium leading-[16px] text-subtle">
              Score
            </th>
            <th className="px-5 py-3 text-left font-body text-[13px] font-medium leading-[16px] text-subtle">
              Status
            </th>
            <th className="px-5 py-3 text-left font-body text-[13px] font-medium leading-[16px] text-subtle">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id} className="border-b border-border last:border-b-0 hover:bg-hover-tint/50">
              <td className="px-5 py-3.5">
                <Link
                  href={`/checker/${scan.id}`}
                  className="font-body text-[15px] leading-[20px] text-fg no-underline hover:text-accent"
                >
                  {scan.fileName}
                </Link>
              </td>
              <td className={cn('px-5 py-3.5 font-display text-[18px] leading-[24px]', scoreColor(scan.overallScore))}>
                {scan.overallScore !== null ? Math.round(scan.overallScore) : '—'}
              </td>
              <td className="px-5 py-3.5">
                {statusBadge(scan.status)}
              </td>
              <td className="px-5 py-3.5 font-body text-[13px] leading-[16px] text-subtle">
                {new Date(scan.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
