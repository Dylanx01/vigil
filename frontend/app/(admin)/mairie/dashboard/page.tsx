"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { adminAPI } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import {
  Shield, Users, AlertTriangle, MessageSquare,
  Radio, Download, LogOut, Activity, Map, RefreshCw
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const capitalizeQuartier = (id: string) =>
  id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function MairieDashboardPage() {
  const { token, role, logout, mounted } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [heatmap, setHeatmap] = useState<any[]>([])
  const [signalements, setSignalements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [alerteLoading, setAlerteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!mounted) return
    if (!token || role !== "admin") {
      router.push("/mairie/login")
      return
    }
    fetchData()
  }, [token, role, mounted])

  const fetchData = async () => {
    if (!token) return
    try {
      const [statsData, heatmapData, signalementsData] = await Promise.all([
        adminAPI.getStats(token),
        adminAPI.getHeatmap(token),
        adminAPI.getSignalements(token)
      ])
      setStats(statsData)
      setHeatmap(heatmapData.heatmap)
      setSignalements(signalementsData.signalements)
      toast.success("Données actualisées")
    } catch {
      router.push("/mairie/login")
    } finally {
      setLoading(false)
    }
  }

  const handleAlerte = async (quartier_id: string) => {
    if (!token) return
    setAlerteLoading(quartier_id)
    try {
      await adminAPI.declencherAlerte({ quartier_id }, token)
      toast.success(`Alerte déclenchée — ${capitalizeQuartier(quartier_id)}`, {
        icon: '🚨',
        duration: 5000,
      })
    } catch {
      toast.error("Erreur lors du déclenchement")
    } finally {
      setAlerteLoading(null)
    }
  }

  const handleExport = (type: "signalements" | "scores") => {
    if (!token) return
    const url = type === "signalements"
      ? adminAPI.exportSignalements(token)
      : adminAPI.exportScores(token)
    window.open(`${url}`, "_blank")
    toast.success("Export CSV en cours...")
  }

  const handleLogout = () => {
    logout()
    router.push("/mairie/login")
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Chargement du dashboard...
          </span>
        </div>
      </div>
    )
  }

  const repartitionData = [
    { label: "Critique", count: heatmap.filter(q => q.niveau === "critique").length, color: "#7C3AED" },
    { label: "Élevé", count: heatmap.filter(q => q.niveau === "eleve").length, color: "#EF4444" },
    { label: "Modéré", count: heatmap.filter(q => q.niveau === "modere").length, color: "#F59E0B" },
    { label: "Faible", count: heatmap.filter(q => q.niveau === "faible").length, color: "#10B981" },
  ]

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Navbar admin */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14"
        style={{ background: "var(--bg-sidebar)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo.svg" alt="Vigil" width={28} height={28} className="flex-shrink-0" />
          <span className="font-bold text-base text-white font-heading whitespace-nowrap">
            Vigil
          </span>
          <span
            className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
          >
            Portail Mairie
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchData}
            aria-label="Actualiser"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--risk-eleve)" }}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className="pt-14 px-4 md:px-6 py-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold mb-1 font-heading" style={{ color: "var(--text-primary)" }}>
            Dashboard — Communauté Urbaine de Douala
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Surveillance en temps réel des risques d'inondation
          </p>
        </div>

        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Abonnés SMS", value: stats.total_abonnes, icon: Users, color: "var(--brand)", niveau: undefined },
              { label: "Signalements 24h", value: stats.signalements_24h, icon: AlertTriangle, color: "var(--risk-modere)", niveau: "modere" as const },
              { label: "SMS envoyés 24h", value: stats.sms_envoyes_24h, icon: MessageSquare, color: "var(--risk-faible)", niveau: "faible" as const },
              { label: "Zones en alerte", value: stats.quartiers_en_alerte, icon: Radio, color: "var(--risk-eleve)", niveau: "eleve" as const },
            ].map(({ label, value, icon: Icon, color, niveau }, i) => (
              <Card
                key={label}
                niveau={niveau}
                className="p-5 animate-fadeInUp"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-squircle flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-xs font-medium font-heading" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
                <AnimatedNumber value={value || 0} className="font-bold text-3xl font-mono" style={{ color: "var(--text-primary)" }} />
              </Card>
            ))}
          </div>
        )}

        {/* Répartition par niveau — donut */}
        <Card className="p-5 mb-6 animate-fadeInUp" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xs font-bold tracking-wider mb-4 font-heading" style={{ color: "var(--text-muted)" }}>
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
                <AnimatedNumber value={heatmap.length} className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>zones</span>
              </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-1 gap-3">
              {repartitionData.map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm font-medium font-heading" style={{ color: "var(--text-primary)" }}>{label}</span>
                  </div>
                  <span className="text-sm font-bold font-mono" style={{ color }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Heatmap */}
          <Card className="p-5 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map size={14} style={{ color: "var(--brand)" }} />
                <h2 className="text-sm font-semibold font-heading" style={{ color: "var(--text-primary)" }}>
                  Carte des risques
                </h2>
              </div>
              <button
                onClick={() => handleExport("scores")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                <Download size={11} />
                CSV
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
              {heatmap
                .sort((a, b) => b.score - a.score)
                .map(q => (
                  <div
                    key={q.quartier_id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-squircle"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${q.niveau === "critique" ? "animate-breathe" : ""}`}
                        style={{
                          background: q.niveau === "critique" ? "var(--risk-critique)"
                            : q.niveau === "eleve" ? "var(--risk-eleve)"
                            : q.niveau === "modere" ? "var(--risk-modere)"
                            : "var(--risk-faible)"
                        }}
                      />
                      <span className="text-sm font-medium font-heading" style={{ color: "var(--text-primary)" }}>
                        {q.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge niveau={q.niveau} size="sm" />
                      <AnimatedNumber
                        value={q.score}
                        decimals={1}
                        className="text-sm font-bold w-12 text-right font-mono"
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <button
                        onClick={() => handleAlerte(q.quartier_id)}
                        disabled={alerteLoading === q.quartier_id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: "var(--risk-eleve-bg)",
                          color: "var(--risk-eleve)",
                          border: "1px solid var(--risk-eleve)"
                        }}
                      >
                        {alerteLoading === q.quartier_id ? "..." : "Alerter"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Signalements */}
          <Card className="p-5 animate-fadeInUp" style={{ animationDelay: "360ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: "var(--brand)" }} />
                <h2 className="text-sm font-semibold font-heading" style={{ color: "var(--text-primary)" }}>
                  Signalements récents
                </h2>
              </div>
              <button
                onClick={() => handleExport("signalements")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                <Download size={11} />
                CSV
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
              {signalements.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                  Aucun signalement dans les 24 dernières heures
                </p>
              ) : signalements.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-squircle"
                  style={{ background: "var(--bg-primary)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.valide ? "var(--risk-eleve)" : "var(--text-muted)" }}
                    />
                    <div>
                      <span className="text-sm font-medium font-heading" style={{ color: "var(--text-primary)" }}>
                        {capitalizeQuartier(s.quartier_id)}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        — Niveau {s.niveau_eau}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: s.valide ? "var(--risk-eleve-bg)" : "#F8FAFC",
                      color: s.valide ? "var(--risk-eleve)" : "var(--text-muted)",
                      border: s.valide ? "1px solid var(--risk-eleve)" : "1px solid var(--border)"
                    }}
                  >
                    {s.valide ? "Confirmé" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Zones en alerte */}
        {stats?.quartiers_alerte_detail?.length > 0 && (
          <Card niveau="eleve" className="p-5 animate-fadeInUp" style={{ animationDelay: "420ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Radio size={14} style={{ color: "var(--risk-eleve)" }} />
              <h2 className="text-sm font-semibold font-heading" style={{ color: "var(--text-primary)" }}>
                Zones nécessitant une intervention
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.quartiers_alerte_detail.map((q: any, i: number) => (
                <div
                  key={q.quartier_id}
                  className="rounded-squircle p-4 flex items-center justify-between animate-fadeInUp"
                  style={{ background: "var(--risk-eleve-bg)", border: "1px solid var(--risk-eleve)", animationDelay: `${460 + i * 40}ms` }}
                >
                  <div>
                    <p className="text-sm font-bold mb-1 font-heading" style={{ color: "var(--text-primary)" }}>
                      {capitalizeQuartier(q.quartier_id)}
                    </p>
                    <Badge niveau={q.niveau} size="sm" />
                  </div>
                  <AnimatedNumber
                    value={q.score}
                    decimals={1}
                    className="font-bold text-2xl font-mono"
                    style={{ color: "var(--risk-eleve)" }}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}