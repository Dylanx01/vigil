"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/Badge"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { useScores } from "@/hooks/useScores"
import { Droplets, AlertTriangle, Activity, Shield, TrendingUp } from "lucide-react"

const niveauColor: Record<string, string> = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

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
  const scoreColor = scoreMoyen >= 75 ? "#7C3AED" : scoreMoyen >= 50 ? "#EF4444" : scoreMoyen >= 25 ? "#F59E0B" : "#10B981"

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar lastUpdate={lastUpdate} />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">

          <div className="mb-6 pt-2">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Statistiques
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>Vue d'ensemble de la situation à Douala</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {/* Hero card score moyen */}
              <div className="rounded-2xl p-6 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${scoreColor}15` }}>
                      <Activity size={15} style={{ color: scoreColor }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "#64748B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Score de risque moyen
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                    <TrendingUp size={10} />
                    {total} zones
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-end gap-2 mb-3">
                    <span className="font-bold leading-none" style={{ fontSize: "56px", color: scoreColor, fontFamily: "'JetBrains Mono', monospace" }}>
                      {scoreMoyen}
                    </span>
                    <span className="text-lg mb-2" style={{ color: "#94A3B8" }}>/100</span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ background: "#F0F4FF" }}>
                    <div className="h-3 rounded-full transition-all duration-1000" style={{ width: `${scoreMoyen}%`, background: `linear-gradient(90deg, #10B981, ${scoreColor})` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: "#EFF6FF" }}>
                  <Droplets size={14} style={{ color: "#0EA5E9" }} />
                  <span className="text-sm font-medium" style={{ color: "#0369A1" }}>Précipitations moyennes 6h :</span>
                  <span className="text-sm font-bold" style={{ color: "#0EA5E9", fontFamily: "'JetBrains Mono', monospace" }}>{pluieMoyenne} mm</span>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Zones en alerte", value: critique + eleve, sub: `sur ${total}`, icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
                  { label: "Zones sûres", value: faible, sub: `sur ${total}`, icon: Shield, color: "#10B981", bg: "#ECFDF5" },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="font-bold text-3xl block mb-0.5" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>{sub}</span>
                    <p className="text-xs font-medium mt-1" style={{ color: "#64748B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Répartition */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 className="text-xs font-bold tracking-wider mb-4" style={{ color: "#94A3B8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>RÉPARTITION PAR NIVEAU</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Critique", count: critique, color: "#7C3AED", bg: "#F5F3FF" },
                    { label: "Élevé", count: eleve, color: "#EF4444", bg: "#FEF2F2" },
                    { label: "Modéré", count: modere, color: "#F59E0B", bg: "#FFFBEB" },
                    { label: "Faible", count: faible, color: "#10B981", bg: "#ECFDF5" },
                  ].map(({ label, count, color, bg }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-14" style={{ color: "#64748B" }}>{label}</span>
                      <div className="flex-1 h-2.5 rounded-full" style={{ background: "#F0F4FF" }}>
                        <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color }} />
                      </div>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ color, background: bg, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 */}
              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 className="text-xs font-bold tracking-wider mb-4" style={{ color: "#94A3B8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>TOP 5 QUARTIERS À RISQUE</h2>
                <div className="flex flex-col gap-4">
                  {topQuartiers.map((score, index) => (
                    <div key={score.quartier_id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: index === 0 ? "#F5F3FF" : "#F8FAFC", color: index === 0 ? "#7C3AED" : "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score.nom}</span>
                          <div className="flex items-center gap-2">
                            <Badge niveau={score.niveau} size="sm" />
                            <span className="text-sm font-bold w-8 text-right" style={{ color: niveauColor[score.niveau], fontFamily: "'JetBrains Mono', monospace" }}>{score.score}</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "#F0F4FF" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${score.score}%`, background: niveauColor[score.niveau] }} />
                        </div>
                      </div>
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