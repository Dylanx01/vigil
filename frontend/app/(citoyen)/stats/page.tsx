"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { useScores } from "@/hooks/useScores"
import { NiveauRisque } from "@/types"
import { Droplets, AlertTriangle, Activity, Shield, TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const niveauColor: Record<string, string> = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

export default function StatsPage() {
  const { scores, loading, lastUpdate, status, refetch } = useScores()

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

  const scoreNiveau: NiveauRisque =
    scoreMoyen >= 75 ? "critique" : scoreMoyen >= 50 ? "eleve" : scoreMoyen >= 25 ? "modere" : "faible"
  const scoreColor = niveauColor[scoreNiveau]

  const repartitionData = [
    { label: "Critique", count: critique, color: "#7C3AED" },
    { label: "Élevé", count: eleve, color: "#EF4444" },
    { label: "Modéré", count: modere, color: "#F59E0B" },
    { label: "Faible", count: faible, color: "#10B981" },
  ]

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar lastUpdate={lastUpdate} status={status} onRetry={refetch} />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-6">

          <div className="mb-6 pt-2">
            <h1 className="text-2xl font-bold mb-1 font-heading" style={{ color: "#0F172A" }}>
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
              <Card niveau={scoreNiveau} className="p-6 mb-4 rounded-squircle-lg animate-fadeInUp">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-squircle flex items-center justify-center ${scoreNiveau === "critique" ? "animate-breathe" : ""}`}
                      style={{ background: `${scoreColor}15` }}
                    >
                      <Activity size={15} style={{ color: scoreColor }} />
                    </div>
                    <span className="text-sm font-semibold font-heading" style={{ color: "#64748B" }}>
                      Score de risque moyen
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                    <TrendingUp size={10} />
                    {total} zones
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-end gap-2 mb-3">
                    <AnimatedNumber
                      value={scoreMoyen}
                      className="font-bold leading-none font-mono"
                      style={{ fontSize: "56px", color: scoreColor }}
                    />
                    <span className="text-lg mb-2" style={{ color: "#94A3B8" }}>/100</span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ background: "#F0F4FF" }}>
                    <div className="h-3 rounded-full transition-all duration-1000" style={{ width: `${scoreMoyen}%`, background: `linear-gradient(90deg, #10B981, ${scoreColor})` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 rounded-squircle" style={{ background: "#EFF6FF" }}>
                  <Droplets size={14} style={{ color: "#0EA5E9" }} />
                  <span className="text-sm font-medium" style={{ color: "#0369A1" }}>Précipitations moyennes 6h :</span>
                  <AnimatedNumber
                    value={pluieMoyenne}
                    decimals={1}
                    className="text-sm font-bold font-mono"
                    style={{ color: "#0EA5E9" }}
                  />
                  <span className="text-sm font-bold font-mono" style={{ color: "#0EA5E9" }}>mm</span>
                </div>
              </Card>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card niveau="eleve" className="p-5 animate-fadeInUp" style={{ animationDelay: "60ms" }}>
                  <div className="w-9 h-9 rounded-squircle flex items-center justify-center mb-3" style={{ background: "#FEF2F2" }}>
                    <AlertTriangle size={16} style={{ color: "#EF4444" }} />
                  </div>
                  <AnimatedNumber value={critique + eleve} className="font-bold text-3xl block mb-0.5 font-mono" style={{ color: "#EF4444" }} />
                  <span className="text-xs" style={{ color: "#94A3B8" }}>sur {total}</span>
                  <p className="text-xs font-medium mt-1 font-heading" style={{ color: "#64748B" }}>Zones en alerte</p>
                </Card>

                <Card niveau="faible" className="p-5 animate-fadeInUp" style={{ animationDelay: "120ms" }}>
                  <div className="w-9 h-9 rounded-squircle flex items-center justify-center mb-3" style={{ background: "#ECFDF5" }}>
                    <Shield size={16} style={{ color: "#10B981" }} />
                  </div>
                  <AnimatedNumber value={faible} className="font-bold text-3xl block mb-0.5 font-mono" style={{ color: "#10B981" }} />
                  <span className="text-xs" style={{ color: "#94A3B8" }}>sur {total}</span>
                  <p className="text-xs font-medium mt-1 font-heading" style={{ color: "#64748B" }}>Zones sûres</p>
                </Card>
              </div>

              {/* Répartition — donut */}
              <Card className="p-5 mb-4 animate-fadeInUp" style={{ animationDelay: "180ms" }}>
                <h2 className="text-xs font-bold tracking-wider mb-4 font-heading" style={{ color: "#94A3B8" }}>
                  RÉPARTITION PAR NIVEAU
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={repartitionData}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={52}
                          outerRadius={76}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={3}
                          animationDuration={900}
                          animationEasing="ease-out"
                        >
                          {repartitionData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <AnimatedNumber value={total} className="text-2xl font-bold font-mono" style={{ color: "#0F172A" }} />
                      <span className="text-xs" style={{ color: "#94A3B8" }}>zones</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-3">
                    {repartitionData.map(({ label, count, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                          <span className="text-sm font-medium font-heading" style={{ color: "#0F172A" }}>{label}</span>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{ color }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Top 5 */}
              <Card className="p-5 animate-fadeInUp" style={{ animationDelay: "240ms" }}>
                <h2 className="text-xs font-bold tracking-wider mb-4 font-heading" style={{ color: "#94A3B8" }}>
                  TOP 5 QUARTIERS À RISQUE
                </h2>
                <div className="flex flex-col gap-4">
                  {topQuartiers.map((score, index) => (
                    <div
                      key={score.quartier_id}
                      className="flex items-center gap-3 animate-fadeInUp"
                      style={{ animationDelay: `${280 + index * 50}ms` }}
                    >
                      <span
                        className="w-6 h-6 rounded-squircle flex items-center justify-center text-xs font-bold flex-shrink-0 font-mono"
                        style={{ background: index === 0 ? "#F5F3FF" : "#F8FAFC", color: index === 0 ? "#7C3AED" : "#94A3B8" }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold font-heading" style={{ color: "#0F172A" }}>{score.nom}</span>
                          <div className="flex items-center gap-2">
                            <Badge niveau={score.niveau} size="sm" />
                            <AnimatedNumber
                              value={score.score}
                              decimals={1}
                              className="text-sm font-bold w-12 text-right font-mono"
                              style={{ color: niveauColor[score.niveau] }}
                            />
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "#F0F4FF" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${score.score}%`, background: niveauColor[score.niveau] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}