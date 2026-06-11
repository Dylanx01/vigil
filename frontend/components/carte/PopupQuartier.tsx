"use client"

import { ScoreRisque } from "@/types"
import { Badge } from "@/components/ui/Badge"
import { Droplets, AlertTriangle, Clock, X } from "lucide-react"

interface PopupQuartierProps {
  score: ScoreRisque
  onClose: () => void
}

const niveauColor = {
  faible: "var(--risk-faible)",
  modere: "var(--risk-modere)",
  eleve: "var(--risk-eleve)",
  critique: "var(--risk-critique)"
}

export function PopupQuartier({ score, onClose }: PopupQuartierProps) {
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
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 rounded-2xl p-5 z-50 animate-fadeIn"
      style={{
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border)"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-heading font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            {score.nom}
          </h3>
          <Badge niveau={score.niveau} size="sm" />
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--bg-primary)" }}
        >
          <X size={14} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Score */}
      <div className="flex items-end gap-1 mb-3">
        <span
          className="mono font-bold text-4xl"
          style={{ color }}
        >
          {score.score}
        </span>
        <span
          className="text-sm mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          / 100
        </span>
      </div>

      {/* Progress */}
      <div
        className="w-full h-2 rounded-full mb-4"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${score.score}%`, background: color }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-primary)" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Droplets size={12} style={{ color: "var(--brand)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Pluie 6h
            </span>
          </div>
          <span className="mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {score.pluie_6h} mm
          </span>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-primary)" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Droplets size={12} style={{ color: "var(--brand)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Pluie 24h
            </span>
          </div>
          <span className="mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {score.pluie_24h} mm
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-1 mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <Clock size={11} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Mis à jour {formatTime(score.calculated_at)}
        </span>
      </div>
    </div>
  )
}