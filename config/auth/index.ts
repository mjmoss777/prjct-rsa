import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { captcha } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';
import { db } from '@/config/db';
import { sendOTPEmail } from '@/lib/email';
import { redisSecondaryStorage } from '@/config/redis';
import { logAuthEvent } from '@/lib/auth-events';
import { isLockedOut, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth-lockout';

const isProd = process.env.NODE_ENV === 'production';

function getIp(request: Request | undefined): string {
  return (
    request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request?.headers.get('x-real-ip') ??
    'unknown'
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  ...(isProd && { secondaryStorage: redisSecondaryStorage() }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: true,
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail(email, otp, type);
        } catch (err) {
          console.error('[email] Failed to send OTP:', (err as Error).message);
        }
      },
    }),
    ...(process.env.TURNSTILE_SECRET_KEY
      ? [
          captcha({
            provider: 'cloudflare-turnstile',
            secretKey: process.env.TURNSTILE_SECRET_KEY,
          }),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    storeSessionInDatabase: true,
  },
  ...(isProd && {
    rateLimit: {
      enabled: true,
      window: 60,
      max: 5,
      storage: 'secondary-storage' as const,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },
  advanced: {
    useSecureCookies: isProd,
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  ],
  ...(isProd && {
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!ctx.path.startsWith('/sign-in') && !ctx.path.startsWith('/email-otp')) {
          return;
        }

        const ip = getIp(ctx.request);
        const lockoutRemaining = await isLockedOut(ip);
        if (lockoutRemaining > 0) {
          const hours = Math.ceil(lockoutRemaining / 3600);
          return new Response(
            JSON.stringify({
              error: { message: `Too many attempts. Try again in ${hours}h.` },
            }),
            { status: 429, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }),
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/email' && ctx.path !== '/sign-in/email-otp') {
          return;
        }

        const ip = getIp(ctx.request);
        const ua = ctx.request?.headers.get('user-agent') ?? null;
        const response = ctx.context.returned as Response | undefined;
        const ok = response?.ok ?? false;

        if (ok && ctx.context.session?.user) {
          await clearFailedAttempts(ip);
          logAuthEvent({
            userId: ctx.context.session.user.id,
            eventType: 'sign_in',
            ipAddress: ip,
            userAgent: ua,
          });
        } else if (!ok) {
          const locked = await recordFailedAttempt(ip);
          logAuthEvent({
            eventType: locked ? 'lockout' : 'sign_in_failed',
            ipAddress: ip,
            userAgent: ua,
            metadata: locked ? { reason: 'rate_limit_exceeded' } : undefined,
          });
        }
      }),
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Auth = typeof auth;
