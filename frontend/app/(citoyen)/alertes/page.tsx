"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/Badge"
import { useScores } from "@/hooks/useScores"
import { useSignalements } from "@/hooks/useSignalements"
import { AlertTriangle, Droplets, Clock, Bell } from "lucide-react"

export default function AlertesPage() {
  const { scores, loading: loadingScores, lastUpdate } = useScores()
  const { signalements, loading: loadingSignalements } = useSignalements()

  const quartiers_alerte = scores.filter(s => s.niveau === "eleve" || s.niveau === "critique")
  const quartiers_modere = scores.filter(s => s.niveau === "modere")

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diff < 1) return "À l'instant"
    if (diff < 60) return `Il y a ${diff} min`
    return `Il y a ${Math.floor(diff / 60)}h`
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar lastUpdate={lastUpdate} />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Alertes actives
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Zones à risque élevé ou critique en ce moment
            </p>
          </div>

          {/* Alertes critiques et élevées */}
          {loadingScores ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
            </div>
          ) : quartiers_alerte.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center mb-6"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <Bell size={32} className="mx-auto mb-3" style={{ color: "var(--risk-faible)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Aucune alerte active
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Tous les quartiers sont sous surveillance normale
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {quartiers_alerte
                .sort((a, b) => b.score - a.score)
                .map(score => (
                  <div
                    key={score.quartier_id}
                    className="rounded-xl p-5"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderLeft: `4px solid ${score.niveau === "critique" ? "var(--risk-critique)" : "var(--risk-eleve)"}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} style={{ color: score.niveau === "critique" ? "var(--risk-critique)" : "var(--risk-eleve)" }} />
                        <span className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {score.nom}
                        </span>
                      </div>
                      <Badge niveau={score.niveau} size="sm" />
                    </div>

                    <div className="w-full h-2 rounded-full mb-3" style={{ background: "var(--border)" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${score.score}%`,
                          background: score.niveau === "critique" ? "var(--risk-critique)" : "var(--risk-eleve)"
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl" style={{
                        color: score.niveau === "critique" ? "var(--risk-critique)" : "var(--risk-eleve)",
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        {score.score}<span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Droplets size={12} style={{ color: "var(--brand)" }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                            {score.pluie_6h}mm/6h
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} style={{ color: "var(--text-muted)" }} />
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {formatTime(score.calculated_at || "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quartiers modérés */}
          {quartiers_modere.length > 0 && (
            <>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                SURVEILLANCE RENFORCÉE
              </h2>
              <div className="flex flex-col gap-2">
                {quartiers_modere
                  .sort((a, b) => b.score - a.score)
                  .map(score => (
                    <div
                      key={score.quartier_id}
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderLeft: "4px solid var(--risk-modere)"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {score.nom}
                        </span>
                        <Badge niveau={score.niveau} size="sm" />
                      </div>
                      <span className="font-bold text-sm" style={{ color: "var(--risk-modere)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {score.score}/100
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* Signalements récents */}
          {signalements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                SIGNALEMENTS CITOYENS RÉCENTS
              </h2>
              <div className="flex flex-col gap-2">
                {signalements.slice(0, 5).map(s => (
                  <div
                    key={s.id}
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.valide ? "var(--risk-eleve)" : "var(--text-muted)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {s.quartier_id} — Niveau {s.niveau_eau}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatTime(s.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}