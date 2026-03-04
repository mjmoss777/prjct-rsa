import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <h1 className="m-0 font-display text-[72px] leading-[76px] tracking-[-0.03em] text-fg">
        404
      </h1>
      <p className="mt-4 font-body text-[18px] leading-[28px] text-muted">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent no-underline transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
