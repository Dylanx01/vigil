export function SkeletonCard() {
  return (
    <div
      className="rounded-squircle p-4"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 rounded-md skeleton-shimmer" />
        <div className="h-6 w-16 rounded-full skeleton-shimmer" />
      </div>
      <div className="h-2 w-full rounded-full mb-2 skeleton-shimmer" />
      <div className="flex justify-between mt-3">
        <div className="h-3 w-20 rounded-md skeleton-shimmer" />
        <div className="h-3 w-20 rounded-md skeleton-shimmer" />
      </div>
    </div>
  )
}