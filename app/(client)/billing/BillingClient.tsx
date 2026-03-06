'use client';

import { useState } from 'react';
import { createCheckoutSession, getPortalUrl } from './actions';

type BillingInfo = {
  plan: string;
  planLabel: string;
  price: number;
  features: string[];
  subscription: {
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: {
    analyses: { used: number; limit: number };
    bulletImprovements: { used: number; limit: number };
    analyzePercentage: number;
  };
};

export function BillingClient({ billing }: { billing: BillingInfo }) {
  const [loading, setLoading] = useState(false);
  const isPro = billing.plan === 'pro';

  async function handleUpgrade() {
    setLoading(true);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const url = await getPortalUrl();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan card */}
      <div className="rounded-[8px] border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[18px] leading-[24px] text-fg">
              {billing.planLabel} Plan
              {billing.price > 0 && (
                <span className="ml-2 font-body text-[15px] font-normal text-muted">
                  ${billing.price}/mo
                </span>
              )}
            </h2>
            {billing.subscription && (
              <p className="mt-1 font-body text-[14px] text-muted">
                Status: {billing.subscription.status}
                {billing.subscription.currentPeriodEnd && (
                  <> &middot; Renews {new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}
                {billing.subscription.cancelAtPeriodEnd && (
                  <span className="ml-2 text-red-500">Cancels at period end</span>
                )}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 font-body text-[13px] font-semibold uppercase tracking-[0.04em] ${
              isPro ? 'bg-accent/10 text-accent' : 'bg-muted/10 text-muted'
            }`}
          >
            {billing.planLabel}
          </span>
        </div>

        <ul className="mt-4 space-y-1.5">
          {billing.features.map((f) => (
            <li key={f} className="font-body text-[14px] text-muted">
              &bull; {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Usage summary */}
      <div className="rounded-[8px] border border-border bg-surface p-6">
        <h2 className="font-display text-[18px] leading-[24px] text-fg">
          Usage This Month
        </h2>

        {/* Analyses */}
        <div className="mt-4">
          <div className="flex justify-between font-body text-[14px] text-muted">
            <span>Resume analyses</span>
            <span>{billing.usage.analyses.used} / {billing.usage.analyses.limit}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full ${billing.usage.analyzePercentage > 90 ? 'bg-red-500' : 'bg-accent'}`}
              style={{ width: `${billing.usage.analyzePercentage}%` }}
            />
          </div>
        </div>

        {/* Bullet improvements */}
        <div className="mt-3">
          <div className="flex justify-between font-body text-[14px] text-muted">
            <span>Bullet improvements</span>
            <span>
              {billing.usage.bulletImprovements.used}
              {billing.usage.bulletImprovements.limit === -1 ? '' : ` / ${billing.usage.bulletImprovements.limit}`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        {isPro ? (
          <button
            type="button"
            onClick={handleManage}
            disabled={loading}
            className="rounded-[8px] border border-border bg-surface px-5 py-2.5 font-body text-[15px] font-medium text-fg transition-colors hover:bg-hover-tint disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Manage Subscription'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="rounded-[8px] bg-accent px-5 py-2.5 font-body text-[15px] font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Upgrade to Pro — $8/mo'}
          </button>
        )}
      </div>
    </div>
  );
}
