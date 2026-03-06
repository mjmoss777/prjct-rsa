'use server';

import { headers } from 'next/headers';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { resumeScan, savedResume } from '@/config/db/schema/ats-schema';

export async function getRecentScans(limit = 10) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  return db
    .select({
      id: resumeScan.id,
      fileName: resumeScan.fileName,
      overallScore: resumeScan.overallScore,
      status: resumeScan.status,
      createdAt: resumeScan.createdAt,
    })
    .from(resumeScan)
    .where(eq(resumeScan.userId, session.user.id))
    .orderBy(desc(resumeScan.createdAt))
    .limit(limit);
}

export async function getSavedResumes(limit = 10) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  return db
    .select({
      id: savedResume.id,
      name: savedResume.name,
      templateType: savedResume.templateType,
      lastScanScore: savedResume.lastScanScore,
      updatedAt: savedResume.updatedAt,
    })
    .from(savedResume)
    .where(eq(savedResume.userId, session.user.id))
    .orderBy(desc(savedResume.updatedAt))
    .limit(limit);
}

export async function deleteScan(scanId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  await db
    .delete(resumeScan)
    .where(and(eq(resumeScan.id, scanId), eq(resumeScan.userId, session.user.id)));
}
