"use client"

import { useState } from "react"
import { MapVigil } from "@/components/carte/MapVigil"
import { BottomNav } from "@/components/layout/BottomNav"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { Badge } from "@/components/ui/Badge"
import { useScores } from "@/hooks/useScores"
import { ScoreRisque } from "@/types"
import { Droplets, Clock, X, Shield, ChevronUp, AlertTriangle, Search, Navigation, Menu } from "lucide-react"

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

const niveauLabel: Record<string, string> = {
  faible: "Risque faible",
  modere: "Risque modéré",
  eleve: "Risque élevé",
  critique: "Risque critique"
}

export default function HomePage() {
  const { scores, loading, lastUpdate } = useScores()
  const [selected, setSelected] = useState<ScoreRisque | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [locating, setLocating] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sortedScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .filter(s => s.nom.toLowerCase().includes(searchQuery.toLowerCase()))

  const alertCount = scores.filter(s => s.niveau === "eleve" || s.niveau === "critique").length
  const critiqueCount = scores.filter(s => s.niveau === "critique").length

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "—"
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return "À l'instant"
    if (diff < 60) return `${diff} min`
    return `${Math.floor(diff / 60)}h`
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude])
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  return (
    <div
      className="relative w-screen overflow-hidden"
      style={{ height: "100dvh", background: "#0A0F1E" }}
    >
      {/* Desktop layout */}
      <div className="hidden md:block">
        <Navbar lastUpdate={lastUpdate} />
        <Sidebar />
      </div>

      {/* Carte plein écran */}
      <div className="absolute inset-0 md:left-56 md:top-14 md:right-80">
      <MapVigil
  scores={scores}
  userLocation={userLocation ? { lng: userLocation[0], lat: userLocation[1] } : null}
  onQuartierClick={(score) => {
            setSelected(score)
            setSheetExpanded(false)
          }}
        />
      </div>

      {/* Bouton géolocalisation */}
      <button
  onClick={handleGeolocate}
  disabled={locating}
  className="absolute z-40 flex items-center justify-center transition-all bottom-64 right-4 md:bottom-40 md:right-[336px]"
  style={{
    width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.8)"
        }}
      >
        <Navigation
          size={18}
          style={{
            color: locating ? "#0EA5E9" : "#64748B",
            animation: locating ? "spin 1s linear infinite" : "none"
          }}
        />
      </button>

      {/* ── MOBILE ── Header flottant */}
      <div className="absolute top-0 left-0 right-0 z-30 md:hidden">
        <div className="flex items-start gap-2 mx-3 mt-12">
          {/* Pill info Vigil */}
          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)"
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "#0EA5E9", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}
                >
                  <Shield size={15} color="white" />
                </div>
                <div>
                  <span
                    className="font-bold text-sm block leading-none"
                    style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Vigil
                  </span>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Douala</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {critiqueCount > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                    style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}
                  >
                    <AlertTriangle size={11} color="#7C3AED" />
                    <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>
                      {critiqueCount} critique{critiqueCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium" style={{ color: "#059669" }}>
                    {lastUpdate
                      ? lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                      : "Live"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton hamburger flottant */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex-shrink-0 flex items-center justify-center rounded-2xl transition-all active:scale-90"
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)"
            }}
            aria-label="Menu"
          >
            <Menu size={20} color="#0F172A" />
            {alertCount > 0 && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: "#EF4444", boxShadow: "0 0 0 2px rgba(255,255,255,0.92)" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Drawer menu mobile */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} lastUpdate={lastUpdate} />

      {/* ── MOBILE ── Fiche quartier sélectionné */}
      {selected && !sheetExpanded && (
        <div
          className="absolute left-3 right-3 z-40 md:hidden"
          style={{ bottom: "84px" }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(24px)",
              border: `1px solid ${niveauColor[selected.niveau]}30`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.12)`
            }}
          >
            <div
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${niveauColor[selected.niveau]}, ${niveauColor[selected.niveau]}40)` }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {selected.nom}
                  </h2>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: niveauBg[selected.niveau], color: niveauColor[selected.niveau] }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: niveauColor[selected.niveau] }} />
                    {niveauLabel[selected.niveau]}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#F0F4FF" }}
                >
                  <X size={14} color="#94A3B8" />
                </button>
              </div>

              <div className="flex items-end gap-2 mb-3">
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "4rem",
                    lineHeight: 1,
                    color: niveauColor[selected.niveau],
                    fontWeight: 700,
                    letterSpacing: "-0.04em"
                  }}
                >
                  {selected.score.toFixed(0)}
                </span>
                <span className="text-lg mb-2" style={{ color: "#94A3B8" }}>/100</span>
              </div>

              <div className="w-full h-1.5 rounded-full mb-5" style={{ background: "#F0F4FF" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${selected.score}%`, background: niveauColor[selected.niveau] }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Pluie 6h", value: `${selected.pluie_6h}mm` },
                  { label: "Pluie 24h", value: `${selected.pluie_24h}mm` },
                  { label: "Mis à jour", value: formatTime(selected.calculated_at) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: niveauBg[selected.niveau] }}
                  >
                    <p className="text-xs mb-1" style={{ color: "#94A3B8" }}>{label}</p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: niveauColor[selected.niveau], fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE ── Bottom sheet */}
      <div
        className="absolute left-0 right-0 z-30 md:hidden transition-all duration-300"
        style={{ bottom: "64px", height: sheetExpanded ? "70vh" : "auto" }}
      >
        <div
          className="rounded-t-3xl overflow-hidden flex flex-col"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.10)",
            height: sheetExpanded ? "100%" : "auto",
            maxHeight: sheetExpanded ? "100%" : "180px"
          }}
        >
          <div
            className="px-5 pt-3 pb-3 flex-shrink-0 cursor-pointer"
            onClick={() => { setSheetExpanded(!sheetExpanded); setSelected(null) }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "#E2E8F0" }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Quartiers de Douala
                </p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {loading ? "Chargement..." : `${scores.length} zones surveillées`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {alertCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#FEF2F2", color: "#EF4444" }}>
                    {alertCount} alerte{alertCount > 1 ? "s" : ""}
                  </span>
                )}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300"
                  style={{ background: "#F0F4FF", transform: sheetExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <ChevronUp size={14} color="#64748B" />
                </div>
              </div>
            </div>
          </div>

          {sheetExpanded && (
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#F0F4FF" }}>
                <Search size={14} color="#94A3B8" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un quartier..."
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: "#0F172A" }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0EA5E9", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedScores.map(score => (
                  <button
                    key={score.quartier_id}
                    onClick={() => { setSelected(score); setSheetExpanded(false) }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: selected?.quartier_id === score.quartier_id ? niveauBg[score.niveau] : "#F8FAFC",
                      border: `1px solid ${selected?.quartier_id === score.quartier_id ? niveauColor[score.niveau] + "40" : "transparent"}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: niveauColor[score.niveau] }} />
                      <span className="text-sm font-semibold" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {score.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge niveau={score.niveau} size="sm" />
                      <span className="text-sm font-bold" style={{ color: niveauColor[score.niveau], fontFamily: "'JetBrains Mono', monospace", minWidth: "32px", textAlign: "right" }}>
                        {score.score.toFixed(0)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── Panel droit */}
      <div
        className="hidden md:flex absolute right-0 top-14 bottom-0 w-80 flex-col"
        style={{ background: "#FFFFFF", borderLeft: "1px solid #E2E8F0" }}
      >
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <h2 className="font-bold text-sm" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quartiers de Douala</h2>
            <p className="text-xs" style={{ color: "#94A3B8" }}>{scores.length} zones surveillées</p>
          </div>
          {alertCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#FEF2F2", color: "#EF4444" }}>
              {alertCount} alerte{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: "1px solid #F0F4FF" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F0F4FF" }}>
            <Search size={13} color="#94A3B8" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 text-xs outline-none bg-transparent"
              style={{ color: "#0F172A" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#F0F4FF" }} />
              ))
            ) : sortedScores.map(score => (
              <button
                key={score.quartier_id}
                onClick={() => setSelected(score)}
                className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: selected?.quartier_id === score.quartier_id ? niveauBg[score.niveau] : "#F8FAFC",
                  borderLeft: `3px solid ${niveauColor[score.niveau]}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score.nom}</span>
                  <Badge niveau={score.niveau} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full h-1 rounded-full mr-3" style={{ background: "#E2E8F0" }}>
                    <div className="h-1 rounded-full" style={{ width: `${score.score}%`, background: niveauColor[score.niveau] }} />
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: niveauColor[score.niveau], fontFamily: "'JetBrains Mono', monospace" }}>
                    {score.score.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    <Droplets size={10} className="inline mr-0.5" style={{ color: "#0EA5E9" }} />
                    {score.pluie_6h}mm
                  </span>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    <Clock size={10} className="inline mr-0.5" />
                    {formatTime(score.calculated_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div
            className="flex-shrink-0 p-4"
            style={{ borderTop: `3px solid ${niveauColor[selected.niveau]}`, background: niveauBg[selected.niveau] }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selected.nom}</h3>
                <Badge niveau={selected.niveau} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-3xl" style={{ color: niveauColor[selected.niveau], fontFamily: "'JetBrains Mono', monospace" }}>
                  {selected.score.toFixed(0)}
                </span>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <X size={12} color="#64748B" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Pluie 6h", value: `${selected.pluie_6h}mm` },
                { label: "Pluie 24h", value: `${selected.pluie_24h}mm` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: niveauColor[selected.niveau], fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}