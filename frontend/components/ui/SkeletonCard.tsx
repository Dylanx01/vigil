export function SkeletonCard() {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="h-4 w-24 rounded"
            style={{ background: "var(--border)" }}
          />
          <div
            className="h-6 w-16 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>
        <div
          className="h-2 w-full rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />
        <div className="flex justify-between mt-3">
          <div
            className="h-3 w-20 rounded"
            style={{ background: "var(--border)" }}
          />
          <div
            className="h-3 w-20 rounded"
            style={{ background: "var(--border)" }}
          />
        </div>
      </div>
    )
  }