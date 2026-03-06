'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, emailOtp, signInOtp } from '@/config/auth/client';
import { OTPInput } from '@/components/ui/OTPInput';
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { cn } from '@/lib/utils';

type Tab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('password');

  // Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Turnstile
  const [turnstileToken, setTurnstileToken] = useState('');

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpPending, setOtpPending] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error: authError } = await signIn({
      email,
      password,
      fetchOptions: { headers: { 'x-captcha-response': turnstileToken } },
    });

    if (authError) {
      setError(authError.message ?? 'Invalid email or password.');
      setPending(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpPending(true);
    setOtpError(null);

    const { error: authError } = await emailOtp.sendVerificationOtp({
      email: otpEmail,
      type: 'sign-in',
      fetchOptions: { headers: { 'x-captcha-response': turnstileToken } },
    });

    if (authError) {
      setOtpError(authError.message ?? 'Could not send code.');
      setOtpPending(false);
      return;
    }

    setOtpPending(false);
    setOtpStep('code');
  }

  async function handleOtpSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    setOtpPending(true);
    setOtpError(null);

    const { error: authError } = await signInOtp({
      email: otpEmail,
      otp,
      fetchOptions: { headers: { 'x-captcha-response': turnstileToken } },
    });

    if (authError) {
      setOtpError(authError.message ?? 'Invalid code.');
      setOtpPending(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleResendOtp() {
    setOtpPending(true);
    setOtpError(null);

    const { error: authError } = await emailOtp.sendVerificationOtp({
      email: otpEmail,
      type: 'sign-in',
      fetchOptions: { headers: { 'x-captcha-response': turnstileToken } },
    });

    if (authError) {
      setOtpError(authError.message ?? 'Could not resend code.');
    }
    setOtpPending(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setOtpError(null);
  }

  const inputClass =
    'w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-3 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent';

  const tabClass = (active: boolean) =>
    cn(
      'flex-1 rounded-pill py-2 font-body text-[14px] font-medium leading-[20px] transition-colors',
      active
        ? 'bg-accent text-on-accent'
        : 'text-muted hover:text-fg',
    );

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="m-0 font-display text-[28px] leading-[34px] tracking-[-0.02em] text-fg">
          Welcome back
        </h1>
        <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
          Sign in to your account
        </p>
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex gap-1 rounded-pill border border-border p-1">
        <button type="button" onClick={() => switchTab('password')} className={tabClass(tab === 'password')}>
          Password
        </button>
        <button type="button" onClick={() => switchTab('otp')} className={tabClass(tab === 'otp')}>
          Email Code
        </button>
      </div>

      {tab === 'password' ? (
        <>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
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

            <div>
              <label htmlFor="password" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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
              {pending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center font-body text-[14px] leading-[20px] text-muted">
            <Link href="/forgot-password" className="text-accent no-underline hover:underline">
              Forgot password?
            </Link>
          </p>
        </>
      ) : otpStep === 'email' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
          <div>
            <label htmlFor="otp-email" className="mb-2 block font-body text-[15px] leading-[18px] text-fg">
              Email
            </label>
            <input
              id="otp-email"
              type="email"
              required
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          {otpError && (
            <p role="alert" className="m-0 font-body text-[15px] leading-[24px] text-error">
              {otpError}
            </p>
          )}

          <button
            type="submit"
            disabled={otpPending}
            className={cn(
              'w-full rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity duration-200',
              otpPending ? 'pointer-events-none opacity-40' : 'cursor-pointer hover:opacity-90',
            )}
          >
            {otpPending ? 'Sending...' : 'Send code'}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleOtpSignIn} className="flex flex-col gap-5">
            <p className="m-0 text-center font-body text-[15px] leading-[24px] text-muted">
              Code sent to <span className="text-fg">{otpEmail}</span>
            </p>

            <OTPInput value={otp} onChange={setOtp} disabled={otpPending} />

            {otpError && (
              <p role="alert" className="m-0 text-center font-body text-[15px] leading-[24px] text-error">
                {otpError}
              </p>
            )}

            <button
              type="submit"
              disabled={otpPending || otp.length < 6}
              className={cn(
                'w-full rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity duration-200',
                otpPending || otp.length < 6 ? 'pointer-events-none opacity-40' : 'cursor-pointer hover:opacity-90',
              )}
            >
              {otpPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex justify-center gap-4 font-body text-[14px] leading-[20px] text-muted">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={otpPending}
              className="text-accent hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => { setOtpStep('email'); setOtp(''); setOtpError(null); }}
              className="text-accent hover:underline"
            >
              Back
            </button>
          </div>
        </>
      )}

      <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

      <p className="mt-6 text-center font-body text-[15px] leading-[24px] text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-accent no-underline hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
