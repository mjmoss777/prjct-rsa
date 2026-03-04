import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/config/auth';
import { ClientNav } from '@/components/layout/ClientNav';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="flex min-h-screen">
      <ClientNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
