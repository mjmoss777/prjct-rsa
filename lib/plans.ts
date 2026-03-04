export type PlanType = 'free' | 'pro';

export const PLAN_LIMITS: Record<PlanType, {
  monthlyTokens: number;
  label: string;
  features: string[];
}> = {
  free: {
    monthlyTokens: 50_000,
    label: 'Free',
    features: ['5 resume scans/month', 'Basic templates', 'AI bullet improvement'],
  },
  pro: {
    monthlyTokens: 500_000,
    label: 'Pro',
    features: ['Unlimited scans', 'All templates', 'Priority AI models', 'DOCX/PDF export'],
  },
};
