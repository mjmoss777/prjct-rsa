import { getUsageStats, getTopUsers } from './actions';

export default async function AdminUsagePage() {
  const [stats, topUsers] = await Promise.all([getUsageStats(), getTopUsers()]);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-[24px] leading-[30px] text-fg">Usage Analytics</h1>
      <p className="mt-2 font-body text-[15px] leading-[24px] text-muted">
        AI token usage across all users this month.
      </p>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Tokens" value={stats.totalTokens.toLocaleString()} />
        <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} />
        <StatCard label="Analyses" value={stats.analyzeCount.toLocaleString()} />
        <StatCard label="Bullet Improvements" value={stats.improveBulletCount.toLocaleString()} />
      </div>

      <div className="mt-4">
        <StatCard label="Estimated Cost" value={`$${stats.estimatedCost.toFixed(2)}`} />
      </div>

      {/* Top users */}
      <h2 className="mt-10 font-display text-[18px] leading-[24px] text-fg">
        Top Users by Token Usage
      </h2>
      <div className="mt-4 overflow-hidden rounded-[8px] border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                User
              </th>
              <th className="px-4 py-3 text-right font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Tokens
              </th>
              <th className="px-4 py-3 text-right font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
                Requests
              </th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((u) => (
              <tr key={u.userId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-body text-[14px] text-fg">{u.userName}</p>
                  <p className="font-body text-[12px] text-muted">{u.userEmail}</p>
                </td>
                <td className="px-4 py-3 text-right font-body text-[14px] text-fg">
                  {u.totalTokens.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-body text-[14px] text-fg">
                  {u.requestCount.toLocaleString()}
                </td>
              </tr>
            ))}
            {topUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center font-body text-[14px] text-muted">
                  No usage data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface p-4">
      <p className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
        {label}
      </p>
      <p className="mt-1 font-display text-[24px] leading-[30px] text-fg">{value}</p>
    </div>
  );
}
