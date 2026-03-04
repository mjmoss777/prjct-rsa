function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-card)] bg-border/50 ${className ?? ''}`} />;
}

export default function CheckerLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-20 py-20">
      <Skeleton className="mb-3 h-[30px] w-[240px]" />
      <Skeleton className="mb-8 h-[24px] w-[400px]" />
      <div className="flex flex-col gap-8">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[48px] w-full rounded-pill" />
      </div>
    </div>
  );
}
