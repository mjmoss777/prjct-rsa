'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { emailOtp } from '@/config/auth/client';
import { OTPInput } from '@/components/ui/OTPInput';
import { cn } from '@/lib/utils';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error: authError } = await emailOtp.sendVerificationOtp({
      email,
      type: 'forget-password',
    });

    if (authError) {
      setError(authError.message ?? 'Could not send reset code.');
      setPending(false);
      return;
    }

    setPending(false);
    setStep('reset');
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setPending(true);
    setError(null);

    const { error: authError } = await emailOtp.resetPassword({
      email,
      otp,
      password: newPassword,
    });

    if (authError) {
      setError(authError.message ?? 'Could not reset password.');
      setPending(false);
      return;
    }

    router.push('/sign-in');
  }

  const inputClass =
    'w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-3 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent';

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="m-0 font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
          {step === 'email' ? 'Reset your password' : 'Enter reset code'}
        </h1>
        <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
          {step === 'email'
            ? "We'll send a code to your email"
            : <>Code sent to <span className="text-fg">{email}</span></>}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-5">
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
              className={inputClass}
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
            {pending ? 'Sending...' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <OTPInput value={otp} onChange={setOtp} disabled={pending} />

          <div>
            <label htmlFor="new-password" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="m-0 font-body text-[15px] leading-[24px] text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || otp.length < 6}
            className={cn(
              'w-full rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity duration-200',
              pending || otp.length < 6 ? 'pointer-events-none opacity-40' : 'cursor-pointer hover:opacity-90',
            )}
          >
            {pending ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center font-body text-[15px] leading-[24px] text-muted">
        {step === 'reset' ? (
          <button
            type="button"
            onClick={() => { setStep('email'); setOtp(''); setError(null); }}
            className="text-accent hover:underline"
          >
            Back
          </button>
        ) : (
          <Link href="/sign-in" className="text-accent no-underline hover:underline">
            Back to sign in
          </Link>
        )}
      </p>
    </>
  );
}
