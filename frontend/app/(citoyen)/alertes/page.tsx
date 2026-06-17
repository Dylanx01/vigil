"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { useScores } from "@/hooks/useScores"
import { useSignalements } from "@/hooks/useSignalements"
import { AlertTriangle, Droplets, Clock, Bell, CheckCircle, AlertCircle } from "lucide-react"

const capitalizeQuartier = (id: string) =>
  id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const niveauColor: Record<string, string> = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

const niveauBg: Record<string, string> = {
  faible: "#ECFDF5",
  modere: "#FFFBEB",
  eleve: "#FEF2F2",
  critique: "#F5F3FF"
}

export default function AlertesPage() {
  const { scores, loading: loadingScores, lastUpdate, status, refetch } = useScores()
  const { signalements } = useSignalements()

  const quartiers_alerte = scores.filter(s => s.niveau === "eleve" || s.niveau === "critique")
  const quartiers_modere = scores.filter(s => s.niveau === "modere")

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    const diff = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diff < 1) return "À l'instant"
    if (diff < 60) return `Il y a ${diff} min`
    return `Il y a ${Math.floor(diff / 60)}h`
  }

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar lastUpdate={lastUpdate} status={status} onRetry={refetch} />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-6 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold font-heading" style={{ color: "#0F172A" }}>
                Alertes actives
              </h1>
              {quartiers_alerte.length > 0 && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                  style={{ background: "#FEF2F2", color: "#EF4444" }}
                >
                  {quartiers_alerte.length}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Zones à risque élevé ou critique en ce moment
            </p>
          </div>

          {/* Alertes critiques et élevées */}
          {loadingScores ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#0EA5E9", borderTopColor: "transparent" }}
              />
            </div>
          ) : quartiers_alerte.length === 0 ? (
            <Card className="p-10 text-center mb-6 animate-fadeInUp">
              <div
                className="w-14 h-14 rounded-squircle flex items-center justify-center mx-auto mb-4"
                style={{ background: "#ECFDF5" }}
              >
                <Bell size={26} style={{ color: "#10B981" }} />
              </div>
              <p className="font-bold text-lg mb-1 font-heading" style={{ color: "#0F172A" }}>
                Aucune alerte active
              </p>
              <p className="text-sm" style={{ color: "#64748B" }}>
                Tous les quartiers sont sous surveillance normale
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {quartiers_alerte
                .sort((a, b) => b.score - a.score)
                .map((score, i) => (
                  <Card
                    key={score.quartier_id}
                    niveau={score.niveau}
                    interactive
                    className="p-5 animate-fadeInUp"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-squircle flex items-center justify-center ${score.niveau === "critique" ? "animate-breathe" : ""}`}
                          style={{ background: niveauBg[score.niveau] }}
                        >
                          <AlertTriangle size={15} style={{ color: niveauColor[score.niveau] }} />
                        </div>
                        <span className="font-bold text-base font-heading" style={{ color: "#0F172A" }}>
                          {score.nom}
                        </span>
                      </div>
                      <Badge niveau={score.niveau} size="sm" />
                    </div>

                    <div className="w-full h-2 rounded-full mb-4" style={{ background: "#F0F4FF" }}>
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${score.score}%`,
                          background: niveauColor[score.niveau]
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-end gap-1">
                        <AnimatedNumber
                          value={score.score}
                          decimals={1}
                          className="font-bold text-3xl font-mono"
                          style={{ color: niveauColor[score.niveau], lineHeight: 1 }}
                        />
                        <span className="text-xs mb-1" style={{ color: "#94A3B8" }}>/100</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{ background: "#EFF6FF" }}
                        >
                          <Droplets size={11} style={{ color: "#0EA5E9" }} />
                          <span className="text-xs font-semibold font-mono" style={{ color: "#0EA5E9" }}>
                            {score.pluie_6h}mm/6h
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={11} style={{ color: "#94A3B8" }} />
                          <span className="text-xs" style={{ color: "#94A3B8" }}>
                            {formatTime(score.calculated_at || "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* Quartiers modérés */}
          {quartiers_modere.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} style={{ color: "#F59E0B" }} />
                <h2 className="text-xs font-bold tracking-wider font-heading" style={{ color: "#94A3B8" }}>
                  SURVEILLANCE RENFORCÉE
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {quartiers_modere
                  .sort((a, b) => b.score - a.score)
                  .map((score, i) => (
                    <Card
                      key={score.quartier_id}
                      niveau="modere"
                      className="p-3.5 flex items-center justify-between animate-fadeInUp"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm font-heading" style={{ color: "#0F172A" }}>
                          {score.nom}
                        </span>
                        <Badge niveau={score.niveau} size="sm" />
                      </div>
                      <span className="font-bold text-sm font-mono" style={{ color: "#F59E0B" }}>
                        {score.score}/100
                      </span>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Signalements récents */}
          {signalements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} style={{ color: "#64748B" }} />
                <h2 className="text-xs font-bold tracking-wider font-heading" style={{ color: "#94A3B8" }}>
                  SIGNALEMENTS CITOYENS RÉCENTS
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {signalements.slice(0, 5).map((s, i) => (
                  <Card
                    key={s.id}
                    className="p-3.5 flex items-center justify-between animate-fadeInUp"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.valide ? "#EF4444" : "#CBD5E1" }}
                      />
                      <div>
                        <span className="text-sm font-semibold font-heading" style={{ color: "#0F172A" }}>
                          {capitalizeQuartier(s.quartier_id)}
                        </span>
                        <span className="text-xs ml-2" style={{ color: "#94A3B8" }}>
                          — Niveau {s.niveau_eau}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: s.valide ? "#FEF2F2" : "#F8FAFC",
                          color: s.valide ? "#EF4444" : "#94A3B8",
                          border: s.valide ? "1px solid #EF4444" : "1px solid #E2E8F0"
                        }}
                      >
                        {s.valide ? "Confirmé" : "En attente"}
                      </span>
                      <span className="text-xs" style={{ color: "#94A3B8" }}>
                        {formatTime(s.created_at)}
                      </span>
                    </div>
                  </Card>
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