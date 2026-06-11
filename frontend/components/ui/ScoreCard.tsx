"use client"

import { ScoreRisque } from "@/types"
import { Badge } from "./Badge"
import { Droplets, Clock } from "lucide-react"

interface ScoreCardProps {
  score: ScoreRisque
  onClick?: () => void
}

const niveauColor = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

export function ScoreCard({ score, onClick }: ScoreCardProps) {
  const color = niveauColor[score.niveau]

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    const diff = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diff < 1) return "À l'instant"
    if (diff < 60) return `Il y a ${diff} min`
    return `Il y a ${Math.floor(diff / 60)}h`
  }

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${color}`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {score.nom}
        </span>
        <Badge niveau={score.niveau} size="sm" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full mb-3" style={{ background: "var(--border)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score.score}%`, background: color }}
        />
      </div>

      {/* Score + stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-1">
          <span className="font-bold text-2xl" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
            {score.score}
          </span>
          <span className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>/100</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Droplets size={11} style={{ color: "var(--brand)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
              {score.pluie_6h}mm
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {formatTime(score.calculated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}