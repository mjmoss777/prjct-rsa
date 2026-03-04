import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { eq, desc, avg, count } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { resumeScan, savedResume } from '@/config/db/schema/ats-schema';
import { DashboardOverview } from '@/components/pages/dashboard/DashboardOverview';
import { ScanHistoryTable } from '@/components/pages/dashboard/ScanHistoryTable';
import { SavedResumesGrid } from '@/components/pages/dashboard/SavedResumesGrid';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [scans, resumes, [stats]] = await Promise.all([
    db
      .select({
        id: resumeScan.id,
        fileName: resumeScan.fileName,
        overallScore: resumeScan.overallScore,
        status: resumeScan.status,
        createdAt: resumeScan.createdAt,
      })
      .from(resumeScan)
      .where(eq(resumeScan.userId, userId))
      .orderBy(desc(resumeScan.createdAt))
      .limit(10),
    db
      .select({
        id: savedResume.id,
        name: savedResume.name,
        templateType: savedResume.templateType,
        lastScanScore: savedResume.lastScanScore,
        updatedAt: savedResume.updatedAt,
      })
      .from(savedResume)
      .where(eq(savedResume.userId, userId))
      .orderBy(desc(savedResume.updatedAt))
      .limit(6),
    db
      .select({
        totalScans: count(resumeScan.id),
        avgScore: avg(resumeScan.overallScore),
      })
      .from(resumeScan)
      .where(eq(resumeScan.userId, userId)),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <div className="mb-10">
        <h1 className="m-0 font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg">
          Dashboard
        </h1>
        <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
          Your resume scans and saved resumes at a glance.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        <DashboardOverview
          totalScans={Number(stats?.totalScans ?? 0)}
          averageScore={stats?.avgScore ? Number(stats.avgScore) : null}
          savedResumesCount={resumes.length}
        />

        {/* Recent scans */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
              Recent Scans
            </h2>
            <Link
              href="/checker"
              className="font-body text-[13px] leading-[16px] text-accent no-underline hover:underline"
            >
              New scan
            </Link>
          </div>
          <ScanHistoryTable scans={scans} />
        </section>

        {/* Saved resumes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
              Saved Resumes
            </h2>
            <Link
              href="/builder"
              className="font-body text-[13px] leading-[16px] text-accent no-underline hover:underline"
            >
              New resume
            </Link>
          </div>
          <SavedResumesGrid resumes={resumes} />
        </section>
      </div>
    </div>
  );
}
