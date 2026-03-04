function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-card)] bg-border/50 ${className ?? ''}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <Skeleton className="mb-2 h-[30px] w-[160px]" />
      <Skeleton className="mb-10 h-[24px] w-[320px]" />

      {/* Stats row */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-[80px]" />
        <Skeleton className="h-[80px]" />
        <Skeleton className="h-[80px]" />
      </div>

      {/* Table skeleton */}
      <Skeleton className="mb-12 h-[280px] w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    </div>
  );
}
