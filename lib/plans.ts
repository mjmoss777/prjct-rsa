export type PlanType = 'free' | 'pro';

export const PLAN_LIMITS: Record<PlanType, {
  monthlyAnalyses: number;
  monthlyBulletImprovements: number;
  maxSavedResumes: number;
  label: string;
  price: number;
  features: string[];
}> = {
  free: {
    monthlyAnalyses: 15,
    monthlyBulletImprovements: 10,
    maxSavedResumes: 3,
    label: 'Free',
    price: 0,
    features: [
      '15 resume analyses/month',
      '10 AI bullet improvements/month',
      '3 saved resumes',
      '2 basic templates',
      'PDF export',
    ],
  },
  pro: {
    monthlyAnalyses: 200,
    monthlyBulletImprovements: -1, // unlimited
    maxSavedResumes: -1, // unlimited
    label: 'Pro',
    price: 8,
    features: [
      '200 resume analyses/month',
      'Unlimited AI bullet improvements',
      'Unlimited saved resumes',
      'All templates',
      'PDF + DOCX export',
      'Priority support',
    ],
  },
};
