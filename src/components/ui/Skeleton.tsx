interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  shape?: "rect" | "circle" | "rounded";
  className?: string;
}

export function Skeleton({
  width,
  height,
  shape = "rect",
  className = "",
}: SkeletonProps) {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
      ? "rounded-lg"
      : "rounded";

  return (
    <div
      className={`animate-shimmer ${shapeClass} ${className}`}
      style={{ width, height }}
    />
  );
}

/* ─── Preset skeleton variants ─── */

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface shadow-soft overflow-hidden">
      <Skeleton width="100%" height={200} shape="rect" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton width="40%" height={14} shape="rounded" />
        <Skeleton width="80%" height={18} shape="rounded" />
        <Skeleton width="50%" height={14} shape="rounded" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton width={80} height={22} shape="rounded" />
          <Skeleton width={60} height={14} shape="rounded" />
        </div>
      </div>
    </div>
  );
}

export function TextLineSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height={14}
          shape="rounded"
        />
      ))}
    </div>
  );
}
