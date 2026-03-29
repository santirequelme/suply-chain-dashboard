import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-brand border-t-transparent",
          SIZE_CLASSES[size]
        )}
        aria-label="Loading"
      />
    </div>
  );
}

interface SpinnerOverlayProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SpinnerOverlay({ show, children, className }: SpinnerOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {show && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-navy-900/80 backdrop-blur-sm rounded-inherit transition-opacity duration-200">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
