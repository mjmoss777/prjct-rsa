'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <h1 className="m-0 font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-[400px] text-center font-body text-[15px] leading-[24px] text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 cursor-pointer rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity hover:opacity-90 [touch-action:manipulation]"
      >
        Try again
      </button>
    </div>
  );
}
