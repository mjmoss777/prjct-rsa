import { getSubscribers, getRevenueStats } from './actions';

export default async function AdminSubscribersPage() {
  const [subscribers, revenue] = await Promise.all([getSubscribers(), getRevenueStats()]);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-[24px] leading-[30px] text-fg">Subscribers</h1>
      <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
        Subscription overview and revenue.
      </p>

      {/* Revenue stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-[8px] border border-border bg-surface p-4">
          <p className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
            Total Subscribers
          </p>
          <p className="mt-1 font-display text-[24px] leading-[30px] text-fg">
            {revenue.totalSubscribers}
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-surface p-4">
          <p className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
            Active Pro
          </p>
          <p className="mt-1 font-display text-[24px] leading-[30px] text-fg">
            {revenue.activeProCount}
          </p>
        </div>
      </div>

      {/* Subscriber list */}
      <div className="mt-8 overflow-hidden rounded-[8px] border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                User
              </th>
              <th className="px-4 py-3 text-left font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Plan
              </th>
              <th className="px-4 py-3 text-left font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Status
              </th>
              <th className="px-4 py-3 text-left font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.userId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-body text-[14px] text-fg">{sub.name}</p>
                  <p className="font-body text-[12px] text-muted">{sub.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 font-body text-[12px] font-semibold uppercase ${
                      sub.plan === 'pro'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-muted/10 text-muted'
                    }`}
                  >
                    {sub.plan}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-[14px] text-fg">{sub.status}</td>
                <td className="px-4 py-3 font-body text-[14px] text-muted">
                  {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center font-body text-[14px] text-muted">
                  No subscribers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
