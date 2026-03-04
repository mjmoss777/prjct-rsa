'use client';

type Props = {
  totalScans: number;
  averageScore: number | null;
  savedResumesCount: number;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <span className="font-body text-[13px] leading-[16px] text-subtle">
        {label}
      </span>
      <span className="font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
        {value}
      </span>
    </div>
  );
}

export function DashboardOverview({ totalScans, averageScore, savedResumesCount }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Scans" value={String(totalScans)} />
      <StatCard
        label="Average Score"
        value={averageScore !== null ? String(Math.round(averageScore)) : '—'}
      />
      <StatCard label="Saved Resumes" value={String(savedResumesCount)} />
    </div>
  );
}
