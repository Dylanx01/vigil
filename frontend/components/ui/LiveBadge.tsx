"use client"

import { ConnectionStatus } from "@/hooks/useScores"

interface LiveBadgeProps {
  lastUpdate?: Date | null
  status?: ConnectionStatus
  onRetry?: () => void
}

const statusConfig = {
  live: {
    dot: "#10B981",
    text: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    label: (lastUpdate: Date | null) =>
      lastUpdate
        ? lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "Live"
  },
  stale: {
    dot: "#F59E0B",
    text: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    label: () => "Connexion instable"
  },
  offline: {
    dot: "#EF4444",
    text: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    label: () => "Hors ligne"
  }
}

export function LiveBadge({ lastUpdate, status = "live", onRetry }: LiveBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-squircle transition-all duration-500"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: config.dot,
            animation: status === "live" ? "pulse 2s infinite" : status === "stale" ? "breathe 1.5s ease-in-out infinite" : "none"
          }}
        />
        <span className="text-xs font-medium font-mono whitespace-nowrap" style={{ color: config.text }}>
          {status === "live" ? "Données en direct" : ""}{" "}
          {status === "live" && lastUpdate ? `— ${config.label(lastUpdate)}` : config.label(lastUpdate)}
        </span>
      </div>

      {(status === "stale" || status === "offline") && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium px-2.5 py-1.5 rounded-squircle transition-all hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
        >
          Réessayer
        </button>
      )}
    </div>
  )
}