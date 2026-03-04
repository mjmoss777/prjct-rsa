import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password with a verification code.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
