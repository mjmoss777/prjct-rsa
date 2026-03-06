import Link from 'next/link';

const categoryNav = [
  { label: 'All', href: '/blog' },
  { label: 'Glossary', href: '/blog?category=glossary' },
  { label: 'Resume Guides', href: '/blog?category=resume-guide' },
  { label: 'Examples', href: '/blog?category=resume-example' },
  { label: 'Comparisons', href: '/blog?category=comparison' },
];

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg no-underline"
            >
              ResumeATS
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {categoryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 font-body text-[14px] text-muted no-underline transition-colors hover:bg-hover-tint hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/sign-up"
            className="rounded-full bg-accent px-6 py-2.5 font-body text-[14px] font-medium text-on-accent no-underline transition-opacity hover:opacity-90"
          >
            Try free
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-[22px] leading-[28px] text-fg">
              Ready to optimize your resume?
            </h2>
            <Link
              href="/sign-up"
              className="rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium text-on-accent no-underline transition-opacity hover:opacity-90"
            >
              Check your ATS score for free
            </Link>
            <p className="font-body text-[13px] text-subtle">
              &copy; {new Date().getFullYear()} ResumeATS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
