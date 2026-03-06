'use server';

import { headers } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/config/db';
import { savedResume, type ResumeData, type TemplateType } from '@/config/db/schema/ats-schema';
import { user } from '@/config/db/schema/auth-schema';
import { auth } from '@/config/auth';
import { generateObject } from 'ai';
import { getModel } from '@/config/ai';
import { z } from 'zod';
import { checkRequestLimit, trackUsage } from '@/lib/usage';
import { PLAN_LIMITS } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';
import { sanitizeBullet, sanitizeText, detectInjection } from '@/lib/sanitize';
import { AI_GUARDRAILS } from '@/lib/scoring/prompts';

export async function saveResume(data: {
  id?: number;
  name: string;
  templateType: TemplateType;
  resumeData: ResumeData;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  // Check saved resume limit for new resumes
  if (!data.id) {
    const [dbUser] = await db
      .select({ plan: user.plan })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    const userPlan = (dbUser?.plan as PlanType) || 'free';
    const maxResumes = PLAN_LIMITS[userPlan].maxSavedResumes;

    if (maxResumes !== -1) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(savedResume)
        .where(eq(savedResume.userId, session.user.id));

      if (count >= maxResumes) {
        throw new Error(`Resume limit reached (${maxResumes}). Upgrade to Pro for unlimited resumes.`);
      }
    }
  }

  if (data.id) {
    await db
      .update(savedResume)
      .set({
        name: data.name,
        templateType: data.templateType,
        resumeData: data.resumeData,
        updatedAt: new Date(),
      })
      .where(eq(savedResume.id, data.id));

    return { id: data.id };
  }

  const [result] = await db
    .insert(savedResume)
    .values({
      userId: session.user.id,
      name: data.name,
      templateType: data.templateType,
      resumeData: data.resumeData,
    })
    .returning({ id: savedResume.id });

  return { id: result.id };
}

export async function deleteResume(id: number) {
  await db.delete(savedResume).where(eq(savedResume.id, id));
}

export async function improveBulletPoint(
  bullet: string,
  jobTitle: string,
  company: string,
): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const userId = session.user.id;

  // Get user plan
  const [dbUser] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const userPlan = (dbUser?.plan as PlanType) || 'free';

  // Check usage limit
  const usage = await checkRequestLimit(userId, userPlan, 'improve_bullet');
  if (!usage.allowed) {
    throw new Error('Monthly bullet improvement limit reached. Upgrade to Pro for unlimited usage.');
  }

  // Sanitize inputs
  const cleanBullet = sanitizeBullet(bullet);
  const cleanJobTitle = sanitizeText(jobTitle, 200);
  const cleanCompany = sanitizeText(company, 200);

  // Check for prompt injection
  if (detectInjection(cleanBullet) || detectInjection(cleanJobTitle) || detectInjection(cleanCompany)) {
    throw new Error('Input contains disallowed content.');
  }

  const modelId = process.env.AI_MODEL || process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

  const { object, usage: aiUsage } = await generateObject({
    model: getModel(),
    schema: z.object({
      improved: z.string().describe('The improved bullet point'),
    }),
    system: `${AI_GUARDRAILS}

You are a resume writing expert. Improve the given bullet point to be more impactful for ATS systems and hiring managers. Use strong action verbs, quantify results where possible, and be concise. Keep it to one sentence. Do not add information that wasn't implied in the original.`,
    prompt: `Job title: ${cleanJobTitle}\nCompany: ${cleanCompany}\n\nOriginal bullet point: ${cleanBullet}`,
  });

  // Track token usage
  if (aiUsage) {
    trackUsage({
      userId,
      requestType: 'improve_bullet',
      inputTokens: aiUsage.inputTokens ?? 0,
      outputTokens: aiUsage.outputTokens ?? 0,
      model: modelId,
    }).catch(() => {});
  }

  return object.improved;
}
