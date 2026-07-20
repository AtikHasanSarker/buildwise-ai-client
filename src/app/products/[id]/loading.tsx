export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="animate-shimmer rounded h-3 w-10" />
          <div className="animate-shimmer rounded h-3 w-5" />
          <div className="animate-shimmer rounded h-3 w-16" />
          <div className="animate-shimmer rounded h-3 w-5" />
          <div className="animate-shimmer rounded h-3 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery skeleton */}
          <div className="flex flex-col gap-3">
            <div className="animate-shimmer rounded-xl aspect-square" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-shimmer rounded-lg w-16 h-16 shrink-0" />
              ))}
            </div>
          </div>

          {/* Details skeleton */}
          <div className="flex flex-col gap-4">
            {/* Category badge */}
            <div className="animate-shimmer rounded-full h-6 w-24" />
            {/* Title */}
            <div className="animate-shimmer rounded-lg h-8 w-4/5" />
            {/* Brand */}
            <div className="animate-shimmer rounded h-4 w-1/3" />
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-shimmer rounded h-5 w-5" />
                ))}
              </div>
              <div className="animate-shimmer rounded h-4 w-24" />
            </div>
            {/* Price */}
            <div className="animate-shimmer rounded-lg h-9 w-36" />
            {/* Divider */}
            <div className="h-px bg-border my-1" />
            {/* Stock */}
            <div className="animate-shimmer rounded-full h-6 w-36" />
            {/* Specs preview card */}
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="animate-shimmer rounded h-3 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="animate-shimmer rounded h-3 w-16" />
                    <div className="animate-shimmer rounded h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-3 mt-2">
              <div className="animate-shimmer rounded-full h-12 flex-1" />
              <div className="animate-shimmer rounded-full h-12 w-36" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-10 border-b border-border">
          <div className="flex gap-6">
            <div className="animate-shimmer rounded h-10 w-28" />
            <div className="animate-shimmer rounded h-10 w-32" />
            <div className="animate-shimmer rounded h-10 w-24" />
          </div>
        </div>

        {/* Tab content skeleton */}
        <div className="py-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-shimmer rounded h-4"
              style={{ width: `${100 - i * 12}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
