function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-card)] bg-border/50 ${className ?? ''}`} />;
}

export default function BuilderLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-20 py-20">
      <Skeleton className="mb-3 h-[30px] w-[200px]" />
      <Skeleton className="mb-10 h-[24px] w-[440px]" />
      <div className="flex gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-[48px] w-full" />
          <Skeleton className="h-[48px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <Skeleton className="h-[600px] w-[400px] shrink-0" />
      </div>
    </div>
  );
}
