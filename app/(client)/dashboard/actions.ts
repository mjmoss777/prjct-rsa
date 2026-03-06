'use server';

import { headers } from 'next/headers';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { resumeScan, savedResume } from '@/config/db/schema/ats-schema';
import { getStorage } from '@/lib/storage';

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

  // Fetch fileUrl before deleting so we can clean up storage
  const [scan] = await db
    .select({ fileUrl: resumeScan.fileUrl })
    .from(resumeScan)
    .where(and(eq(resumeScan.id, scanId), eq(resumeScan.userId, session.user.id)))
    .limit(1);

  await db
    .delete(resumeScan)
    .where(and(eq(resumeScan.id, scanId), eq(resumeScan.userId, session.user.id)));

  // Clean up the uploaded file
  if (scan?.fileUrl) {
    const storage = getStorage();
    storage.remove(scan.fileUrl).catch(() => {});
  }
}
