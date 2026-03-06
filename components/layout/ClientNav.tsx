'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/config/auth/client';
import { cn } from '@/lib/utils';
import { UsageWidget } from './UsageWidget';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'ATS Checker', href: '/checker' },
  { label: 'Resume Builder', href: '/builder' },
  { label: 'Billing', href: '/billing' },
];

const adminItems = [
  { label: 'Pages', href: '/admin/pages' },
  { label: 'Blog', href: '/admin/blog' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Usage', href: '/admin/usage' },
  { label: 'Subscribers', href: '/admin/subscribers' },
];

export function ClientNav({ disabled = false }: { disabled?: boolean }) {
  const pathname = usePathname();
  const { data: sessionData } = useSession();
  const isAdmin = (sessionData?.user as { role?: string } | undefined)?.role === 'admin';

  const linkClass = (isActive: boolean) =>
    cn(
      'rounded-[8px] px-3 py-2.5 font-body text-[15px] leading-[20px] no-underline transition-colors duration-150',
      disabled
        ? 'pointer-events-none opacity-40 text-muted'
        : isActive
          ? 'bg-accent/10 font-medium text-accent'
          : 'text-muted hover:bg-hover-tint hover:text-fg',
    );

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg no-underline">
          ResumeATS
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : undefined}
            className={linkClass(pathname.startsWith(item.href))}
          >
            {item.label}
          </Link>
        ))}

        {/* Admin section */}
        {isAdmin && !disabled && (
          <>
            <div className="mt-4 border-t border-border pt-4">
              <span className="px-3 font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Admin
              </span>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(pathname.startsWith(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Usage widget */}
      {!disabled && <UsageWidget />}

      {/* Sign out */}
      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={async () => { await signOut(); window.location.href = '/sign-in'; }}
          className="w-full rounded-[8px] bg-transparent px-3 py-2.5 text-left font-body text-[15px] leading-[20px] text-muted transition-colors duration-150 hover:bg-hover-tint hover:text-fg [touch-action:manipulation]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
