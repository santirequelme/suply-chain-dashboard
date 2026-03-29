import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { Skeleton, SkeletonCard, SkeletonChart, SkeletonTable, SkeletonAlertChips, SkeletonSmallCard, SkeletonList } from "./Skeleton";
import type { LoadingVariant } from "@/hooks/useLoading";

interface LoadingWrapperProps {
  isLoading: boolean;
  variant: LoadingVariant;
  children: React.ReactNode;
  className?: string;
  spinnerClassName?: string;
}

export function LoadingWrapper({
  isLoading,
  variant,
  children,
  className,
  spinnerClassName,
}: LoadingWrapperProps) {
  if (!isLoading) {
    return (
      <div className={cn("transition-opacity duration-300 opacity-100", className)}>
        {children}
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className={cn("relative min-h-[200px]", className)}>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-white/90 dark:bg-navy-900/90",
            "transition-opacity duration-200"
          )}
        >
          <LoadingSpinner size="lg" className={spinnerClassName} />
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

interface LoadingContentProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingContent({
  isLoading,
  children,
  className,
}: LoadingContentProps) {
  return (
    <div className={cn("transition-all duration-300", isLoading && "opacity-0", className)}>
      {children}
    </div>
  );
}

interface LoadingSkeletonProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingSkeleton({
  isLoading,
  skeleton,
  children,
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "transition-all duration-300",
          isLoading ? "opacity-0 absolute inset-0 pointer-events-none" : "opacity-100"
        )}
      >
        {children}
      </div>
      {isLoading && (
        <div className="transition-all duration-300 opacity-100">
          {skeleton}
        </div>
      )}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonAlertChips,
  SkeletonSmallCard,
  SkeletonList,
  LoadingSpinner,
};
