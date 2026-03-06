'use client';

import { signOut } from '@/config/auth/client';

export function BannedScreen({ reason }: { reason?: string | null }) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-error-soft">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-error"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1 className="mt-6 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
          Account suspended
        </h1>

        <p className="mt-3 font-body text-[15px] leading-[24px] text-muted">
          Your account has been suspended and you no longer have access to this platform.
        </p>

        {reason && (
          <p className="mt-4 rounded-[8px] border border-border bg-surface px-4 py-3 font-body text-[14px] leading-[20px] text-muted">
            {reason}
          </p>
        )}

        <p className="mt-6 font-body text-[13px] leading-[16px] text-subtle">
          If you believe this is a mistake, please contact support.
        </p>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = '/sign-in';
          }}
          className="mt-8 rounded-full border border-border-soft bg-transparent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-fg transition-colors hover:bg-hover-tint [touch-action:manipulation]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
