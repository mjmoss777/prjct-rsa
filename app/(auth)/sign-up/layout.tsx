import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free ResumeATS account. Check your resume against ATS systems and build optimized resumes.',
  alternates: { canonical: '/sign-up' },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
