'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emailOtp } from '@/config/auth/client';
import { OTPInput } from '@/components/ui/OTPInput';
import { cn } from '@/lib/utils';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    setPending(true);
    setError(null);

    const { error: authError } = await emailOtp.verifyEmail({
      email,
      otp,
    });

    if (authError) {
      setError(authError.message ?? 'Invalid code. Please try again.');
      setPending(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleResend() {
    setResending(true);
    setError(null);

    const { error: authError } = await emailOtp.sendVerificationOtp({
      email,
      type: 'email-verification',
    });

    if (authError) {
      setError(authError.message ?? 'Could not resend code.');
    }
    setResending(false);
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="m-0 font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
          Check your email
        </h1>
        <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
          We sent a 6-digit code to{' '}
          <span className="text-fg">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <OTPInput value={otp} onChange={setOtp} disabled={pending} />

        {error && (
          <p role="alert" className="m-0 text-center font-body text-[15px] leading-[24px] text-error">
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
          {pending ? 'Verifying...' : 'Verify email'}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-[15px] leading-[24px] text-muted">
        Didn&apos;t get the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-accent hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend code'}
        </button>
      </p>
    </>
  );
}
