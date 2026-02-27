import { CheckerForm } from '@/components/pages/checker/CheckerForm';

export const metadata = {
  title: 'ATS Resume Checker',
  description: 'Upload your resume and paste a job description to get a detailed ATS compatibility score.',
};

export default function CheckerPage() {
  return (
    <div className="mx-auto max-w-[640px] px-20 py-20">
      <div className="mb-8">
        <h1 className="m-0 font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg [text-wrap:balance]">
          ATS Resume Checker
        </h1>
        <p className="mt-3 font-body text-[15px] leading-[24px] text-muted">
          Upload your resume and paste the job description to see how well it scores with applicant tracking systems.
        </p>
      </div>
      <CheckerForm />
    </div>
  );
}
