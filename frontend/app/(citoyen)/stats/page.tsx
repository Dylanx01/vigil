"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/Badge"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { useScores } from "@/hooks/useScores"
import { Droplets, AlertTriangle, Activity, Shield } from "lucide-react"

export default function StatsPage() {
  const { scores, loading, lastUpdate } = useScores()

  const total = scores.length
  const critique = scores.filter(s => s.niveau === "critique").length
  const eleve = scores.filter(s => s.niveau === "eleve").length
  const modere = scores.filter(s => s.niveau === "modere").length
  const faible = scores.filter(s => s.niveau === "faible").length

  const scoreMoyen = total > 0
    ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / total)
    : 0

  const pluieMoyenne = total > 0
    ? Math.round(scores.reduce((acc, s) => acc + s.pluie_6h, 0) / total * 10) / 10
    : 0

  const topQuartiers = [...scores].sort((a, b) => b.score - a.score).slice(0, 5)

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar lastUpdate={lastUpdate} />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Statistiques
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Vue d'ensemble de la situation à Douala
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} style={{ color: "var(--brand)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Score moyen
                    </span>
                  </div>
                  <span className="font-bold text-3xl" style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {scoreMoyen}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets size={14} style={{ color: "var(--brand)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Pluie moyenne 6h
                    </span>
                  </div>
                  <span className="font-bold text-3xl" style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {pluieMoyenne}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>mm</span>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: "var(--risk-eleve)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Zones en alerte
                    </span>
                  </div>
                  <span className="font-bold text-3xl" style={{ color: "var(--risk-eleve)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {critique + eleve}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>/ {total}</span>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} style={{ color: "var(--risk-faible)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Zones sûres
                    </span>
                  </div>
                  <span className="font-bold text-3xl" style={{ color: "var(--risk-faible)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {faible}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>/ {total}</span>
                </div>
              </div>

              {/* Répartition niveaux */}
              <div
                className="rounded-xl p-5 mb-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  RÉPARTITION PAR NIVEAU
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Critique", count: critique, color: "var(--risk-critique)" },
                    { label: "Élevé", count: eleve, color: "var(--risk-eleve)" },
                    { label: "Modéré", count: modere, color: "var(--risk-modere)" },
                    { label: "Faible", count: faible, color: "var(--risk-faible)" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs w-16" style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top quartiers à risque */}
              <div
                className="rounded-xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  TOP 5 QUARTIERS À RISQUE
                </h2>
                <div className="flex flex-col gap-3">
                  {topQuartiers.map((score, index) => (
                    <div key={score.quartier_id} className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: index === 0 ? "var(--risk-critique-bg)" : "var(--bg-primary)",
                          color: index === 0 ? "var(--risk-critique)" : "var(--text-muted)",
                          fontFamily: "'JetBrains Mono', monospace"
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {score.nom}
                      </span>
                      <Badge niveau={score.niveau} size="sm" />
                      <span className="text-sm font-bold" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {score.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}