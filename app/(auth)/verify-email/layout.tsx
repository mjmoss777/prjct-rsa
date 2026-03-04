import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Enter the verification code sent to your email.',
  alternates: { canonical: '/verify-email' },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
