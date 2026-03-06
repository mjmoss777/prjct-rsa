import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { ClientNav } from '@/components/layout/ClientNav';
import { BannedScreen } from '@/components/layout/BannedScreen';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  const [dbUser] = await db
    .select({ isBanned: user.isBanned, banReason: user.banReason })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const isBanned = dbUser?.isBanned ?? false;

  return (
    <div className="flex min-h-screen">
      <ClientNav disabled={isBanned} />
      <main className="flex-1 overflow-y-auto">
        {isBanned ? <BannedScreen reason={dbUser?.banReason} /> : children}
      </main>
    </div>
  );
}
