'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/config/auth/client';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'ATS Checker', href: '/checker' },
  { label: 'Resume Builder', href: '/builder' },
];

const adminItems = [
  { label: 'Pages', href: '/admin/pages' },
];

export function ClientNav() {
  const pathname = usePathname();
  const { data: sessionData } = useSession();
  const isAdmin = (sessionData?.user as { role?: string } | undefined)?.role === 'admin';

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg no-underline">
          ResumeATS
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-[8px] px-3 py-2.5 font-body text-[15px] leading-[20px] no-underline transition-colors duration-150',
                isActive
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted hover:bg-hover-tint hover:text-fg',
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="mt-4 border-t border-border pt-4">
              <span className="px-3 font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Admin
              </span>
            </div>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-[8px] px-3 py-2.5 font-body text-[15px] leading-[20px] no-underline transition-colors duration-150',
                    isActive
                      ? 'bg-accent/10 font-medium text-accent'
                      : 'text-muted hover:bg-hover-tint hover:text-fg',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

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
