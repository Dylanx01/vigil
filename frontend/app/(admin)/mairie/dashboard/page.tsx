"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { adminAPI } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import {
  Shield, Users, AlertTriangle, MessageSquare,
  Radio, Download, LogOut, Activity, Map
} from "lucide-react"

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
      alert("Alerte déclenchée avec succès")
    } catch {
      alert("Erreur lors du déclenchement")
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

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Navbar admin */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
        style={{ background: "var(--bg-sidebar)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Shield size={14} color="white" />
          </div>
          <span
            className="font-bold text-base text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Vigil
          </span>
          <span
            className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
          >
            Portail Mairie
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
          >
            Actualiser
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--risk-eleve)" }}
          >
            <LogOut size={12} />
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="pt-14 px-6 py-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Dashboard — Communauté Urbaine de Douala
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Surveillance en temps réel des risques d'inondation
          </p>
        </div>

        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Abonnés SMS", value: stats.total_abonnes, icon: Users, color: "var(--brand)" },
              { label: "Signalements 24h", value: stats.signalements_24h, icon: AlertTriangle, color: "var(--risk-modere)" },
              { label: "SMS envoyés 24h", value: stats.sms_envoyes_24h, icon: MessageSquare, color: "var(--risk-faible)" },
              { label: "Zones en alerte", value: stats.quartiers_en_alerte, icon: Radio, color: "var(--risk-eleve)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
                <span
                  className="font-bold text-3xl"
                  style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Heatmap */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map size={14} style={{ color: "var(--brand)" }} />
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Carte des risques
                </h2>
              </div>
              <button
                onClick={() => handleExport("scores")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
              >
                <Download size={11} />
                CSV
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {heatmap
                .sort((a, b) => b.score - a.score)
                .map(q => (
                  <div
                    key={q.quartier_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: q.niveau === "critique" ? "var(--risk-critique)"
                            : q.niveau === "eleve" ? "var(--risk-eleve)"
                            : q.niveau === "modere" ? "var(--risk-modere)"
                            : "var(--risk-faible)"
                        }}
                      />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {q.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge niveau={q.niveau} size="sm" />
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {q.score}
                      </span>
                      <button
                        onClick={() => handleAlerte(q.quartier_id)}
                        disabled={alerteLoading === q.quartier_id}
                        className="px-2 py-1 rounded text-xs font-medium"
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
          </div>

          {/* Signalements */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: "var(--brand)" }} />
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Signalements récents
                </h2>
              </div>
              <button
                onClick={() => handleExport("signalements")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
              >
                <Download size={11} />
                CSV
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {signalements.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                  Aucun signalement dans les 24 dernières heures
                </p>
              ) : signalements.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: "var(--bg-primary)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.valide ? "var(--risk-eleve)" : "var(--text-muted)" }}
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {s.quartier_id}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        Niveau {s.niveau_eau}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: s.valide ? "var(--risk-eleve-bg)" : "var(--bg-primary)",
                      color: s.valide ? "var(--risk-eleve)" : "var(--text-muted)"
                    }}
                  >
                    {s.valide ? "Confirmé" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zones en alerte */}
        {stats?.quartiers_alerte_detail?.length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "4px solid var(--risk-eleve)"
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Radio size={14} style={{ color: "var(--risk-eleve)" }} />
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Zones nécessitant une intervention
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.quartiers_alerte_detail.map((q: any) => (
                <div
                  key={q.quartier_id}
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: "var(--risk-eleve-bg)", border: "1px solid var(--risk-eleve)" }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {q.quartier_id}
                    </p>
                    <Badge niveau={q.niveau} size="sm" />
                  </div>
                  <span
                    className="font-bold text-lg"
                    style={{ color: "var(--risk-eleve)", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {q.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}