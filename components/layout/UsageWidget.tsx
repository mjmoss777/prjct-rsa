'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserUsage } from '@/app/(client)/usage/actions';

type UsageData = {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
};

export function UsageWidget() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    getUserUsage().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const isPro = data.plan === 'pro';

  return (
    <div className="px-3 pb-3">
      <div className="rounded-[8px] border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
            Usage
          </span>
          <span
            className={`rounded-full px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-[0.04em] ${
              isPro
                ? 'bg-accent/10 text-accent'
                : 'bg-muted/10 text-muted'
            }`}
          >
            {data.plan}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all ${
              data.percentage > 90 ? 'bg-red-500' : 'bg-accent'
            }`}
            style={{ width: `${data.percentage}%` }}
          />
        </div>

        <p className="mt-1.5 font-body text-[12px] text-muted">
          {data.remaining.toLocaleString()} tokens remaining
        </p>

        {!isPro && (
          <Link
            href="/billing"
            className="mt-2 block rounded-[6px] bg-accent px-3 py-1.5 text-center font-body text-[13px] font-medium text-white no-underline transition-colors hover:bg-accent/90"
          >
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
