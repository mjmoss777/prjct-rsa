'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { savedResume, type ResumeData, type TemplateType } from '@/config/db/schema/ats-schema';
import { auth } from '@/config/auth';
import { generateObject } from 'ai';
import { getModel } from '@/config/ai';
import { z } from 'zod';

export async function saveResume(data: {
  id?: number;
  name: string;
  templateType: TemplateType;
  resumeData: ResumeData;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

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
  const { object } = await generateObject({
    model: getModel(),
    schema: z.object({
      improved: z.string().describe('The improved bullet point'),
    }),
    system: `You are a resume writing expert. Improve the given bullet point to be more impactful for ATS systems and hiring managers. Use strong action verbs, quantify results where possible, and be concise. Keep it to one sentence. Do not add information that wasn't implied in the original.`,
    prompt: `Job title: ${jobTitle}\nCompany: ${company}\n\nOriginal bullet point: ${bullet}`,
  });

  return object.improved;
}
