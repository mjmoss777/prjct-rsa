import type { PlanType } from './plans';

const PLAN_RANK: Record<PlanType, number> = { free: 0, pro: 1 };

export const FEATURE_GATES: Record<string, PlanType> = {
  analyze: 'free',
  improve_bullet: 'free',
  export_pdf: 'pro',
  export_docx: 'pro',
  premium_templates: 'pro',
};

export function canAccessFeature(userPlan: PlanType, feature: string): boolean {
  const requiredPlan = FEATURE_GATES[feature];
  if (!requiredPlan) return true;
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}
