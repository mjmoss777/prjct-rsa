'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/config/auth/client';
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setPending(false);
      return;
    }

    const { error: authError } = await signUp({
      name,
      email,
      password,
      fetchOptions: { headers: { 'x-captcha-response': turnstileToken } },
    });

    if (authError) {
      setError(authError.message ?? 'Could not create account.');
      setPending(false);
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="m-0 font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
          Create your account
        </h1>
        <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
          Start checking and building ATS-optimized resumes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="name" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-3 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-3 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-3 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent"
          />
        </div>

        {error && (
          <p role="alert" className="m-0 font-body text-[15px] leading-[24px] text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            'w-full rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity duration-200',
            pending ? 'pointer-events-none opacity-40' : 'cursor-pointer hover:opacity-90',
          )}
        >
          {pending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

      <p className="mt-6 text-center font-body text-[15px] leading-[24px] text-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-accent no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
