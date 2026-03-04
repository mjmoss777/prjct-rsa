import Link from 'next/link';

export function UpgradePrompt({ feature }: { feature?: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface p-6 text-center">
      <p className="font-display text-[18px] leading-[24px] text-fg">
        Upgrade to Pro
      </p>
      <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
        {feature
          ? `${feature} requires the Pro plan.`
          : 'Upgrade to unlock this feature.'}
      </p>
      <Link
        href="/billing"
        className="mt-4 inline-block rounded-[8px] bg-accent px-5 py-2.5 font-body text-[15px] font-medium text-white no-underline transition-colors hover:bg-accent/90"
      >
        View Plans
      </Link>
    </div>
  );
}
