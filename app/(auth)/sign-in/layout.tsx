import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your ResumeATS account to check and build ATS-optimized resumes.',
  alternates: { canonical: '/sign-in' },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
