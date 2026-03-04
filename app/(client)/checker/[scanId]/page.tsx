import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { resumeScan } from '@/config/db/schema/ats-schema';
import { getStorage } from '@/lib/storage';
import { ScanResultsView } from '@/components/pages/checker/ScanResultsView';

export const metadata = {
  title: 'Scan Results',
};

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  const id = parseInt(scanId, 10);
  if (isNaN(id)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) notFound();

  const scan = await db.query.resumeScan.findFirst({
    where: and(eq(resumeScan.id, id), eq(resumeScan.userId, session.user.id)),
  });

  if (!scan) notFound();

  // Resolve file URL
  let fileUrl: string | null = null;
  if (scan.fileUrl) {
    const storage = getStorage();
    fileUrl = await storage.getUrl(scan.fileUrl);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ScanResultsView scan={scan} fileUrl={fileUrl} />
    </div>
  );
}
