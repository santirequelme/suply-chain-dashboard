import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-md",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("card p-5 flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonKpiCard({ className }: SkeletonProps) {
  return <SkeletonCard className={className} />;
}

export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn("card p-5 flex flex-col gap-4", className)}>
      <Skeleton className="h-4 w-40" />
      <div className="flex-1 min-h-[200px] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="th">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="tr">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="td">
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonAlertChips({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-8" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSmallCard({ className }: SkeletonProps) {
  return (
    <div className={cn("card px-4 py-3", className)}>
      <Skeleton className="h-5 w-20 mb-1" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
