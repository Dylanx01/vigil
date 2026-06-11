"use client"

import { ScoreRisque } from "@/types"
import { Badge } from "./Badge"
import { Droplets, AlertTriangle, Clock } from "lucide-react"

interface ScoreCardProps {
  score: ScoreRisque
  onClick?: () => void
}

const niveauColor = {
  faible: "var(--risk-faible)",
  modere: "var(--risk-modere)",
  eleve: "var(--risk-eleve)",
  critique: "var(--risk-critique)"
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
      className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] animate-fadeIn"
      style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border)`,
        boxShadow: "var(--shadow-sm)",
        borderLeft: `4px solid ${color}`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-heading font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {score.nom}
        </span>
        <Badge niveau={score.niveau} size="sm" />
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-3"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{
            width: `${score.score}%`,
            background: color
          }}
        />
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="mono text-2xl font-bold"
          style={{ color }}
        >
          {score.score}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          / 100
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Droplets
            size={12}
            style={{ color: "var(--brand)" }}
          />
          <span
            className="mono text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {score.pluie_6h}mm/6h
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock
            size={12}
            style={{ color: "var(--text-muted)" }}
          />
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {formatTime(score.calculated_at)}
          </span>
        </div>
      </div>
    </div>
  )
}