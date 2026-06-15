"use client"

import { useState } from "react"
import { MapVigil } from "@/components/carte/MapVigil"
import { BottomNav } from "@/components/layout/BottomNav"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { SkeletonRow } from "@/components/ui/SkeletonRow"
import { StatusMessages } from "@/components/ui/StatusMessages"
import { useScores } from "@/hooks/useScores"
import { ScoreRisque } from "@/types"
import { Droplets, Clock, X, ChevronUp, AlertTriangle, Search, Navigation, Menu } from "lucide-react"

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
        className="absolute z-40 flex items-center justify-center transition-all bottom-64 right-4 md:bottom-40 md:right-[336px] rounded-squircle"
        style={{
          width: "44px",
          height: "44px",
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
            className="flex-1 rounded-squircle-lg overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)"
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="Vigil" width={32} height={32} />
                <div>
                  <span className="font-bold text-sm block leading-none font-heading" style={{ color: "#0F172A" }}>
                    Vigil
                  </span>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Douala</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {critiqueCount > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-squircle animate-breathe"
                    style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}
                  >
                    <AlertTriangle size={11} color="#7C3AED" />
                    <span className="text-xs font-bold font-mono" style={{ color: "#7C3AED" }}>
                      {critiqueCount} critique{critiqueCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-squircle"
                  style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium font-mono" style={{ color: "#059669" }}>
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
            className="relative flex-shrink-0 flex items-center justify-center rounded-squircle-lg transition-all active:scale-90"
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
          className="absolute left-3 right-3 z-40 md:hidden animate-fadeInUp"
          style={{ bottom: "84px" }}
        >
          <div
            className="rounded-squircle-lg overflow-hidden"
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
                  <h2 className="text-xl font-bold mb-1 font-heading" style={{ color: "#0F172A" }}>
                    {selected.nom}
                  </h2>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: niveauBg[selected.niveau], color: niveauColor[selected.niveau] }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${selected.niveau === "critique" ? "animate-breathe" : "animate-pulse"}`} style={{ background: niveauColor[selected.niveau] }} />
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
                <AnimatedNumber
                  value={selected.score}
                  className="font-mono"
                  style={{
                    fontSize: "4rem",
                    lineHeight: 1,
                    color: niveauColor[selected.niveau],
                    fontWeight: 700,
                    letterSpacing: "-0.04em"
                  }}
                />
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
                  <div key={label} className="rounded-squircle p-3 text-center" style={{ background: niveauBg[selected.niveau] }}>
                    <p className="text-xs mb-1" style={{ color: "#94A3B8" }}>{label}</p>
                    <p className="text-sm font-semibold font-mono" style={{ color: niveauColor[selected.niveau] }}>
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
          className="rounded-t-[28px] overflow-hidden flex flex-col"
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
                <p className="text-sm font-bold font-heading" style={{ color: "#0F172A" }}>
                  Quartiers de Douala
                </p>
                <p className="text-xs font-mono" style={{ color: "#94A3B8" }}>
                  {loading ? "Chargement..." : `${scores.length} zones surveillées`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {alertCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full font-mono animate-breathe" style={{ background: "#FEF2F2", color: "#EF4444" }}>
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
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-squircle" style={{ background: "#F0F4FF" }}>
                <Search size={14} color="#94A3B8" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un quartier..."
                  className="flex-1 text-sm outline-none bg-transparent font-heading"
                  style={{ color: "#0F172A" }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex flex-col gap-2 pt-1">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : scores.length === 0 ? (
              <StatusMessages />
            ) : (
              <div className="flex flex-col gap-2">
                {sortedScores.map((score, i) => {
                  const isSelected = selected?.quartier_id === score.quartier_id
                  return (
                    <Card
                      key={score.quartier_id}
                      niveau={score.niveau}
                      interactive
                      onClick={() => { setSelected(score); setSheetExpanded(false) }}
                      className="p-3 flex items-center justify-between animate-fadeInUp"
                      style={{
                        animationDelay: `${Math.min(i * 20, 300)}ms`,
                        ...(isSelected ? { background: niveauBg[score.niveau], borderColor: niveauColor[score.niveau] + "50" } : {})
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${score.niveau === "critique" ? "animate-breathe" : ""}`} style={{ background: niveauColor[score.niveau] }} />
                        <span className="text-sm font-semibold font-heading" style={{ color: "#0F172A" }}>
                          {score.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge niveau={score.niveau} size="sm" />
                        <AnimatedNumber
                          value={score.score}
                          className="text-sm font-bold font-mono"
                          style={{ color: niveauColor[score.niveau], minWidth: "32px", textAlign: "right" }}
                        />
                      </div>
                    </Card>
                  )
                })}
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
            <h2 className="font-bold text-sm font-heading" style={{ color: "#0F172A" }}>Quartiers de Douala</h2>
            <p className="text-xs font-mono" style={{ color: "#94A3B8" }}>{scores.length} zones surveillées</p>
          </div>
          {alertCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full font-mono animate-breathe" style={{ background: "#FEF2F2", color: "#EF4444" }}>
              {alertCount} alerte{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: "1px solid #F0F4FF" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-squircle" style={{ background: "#F0F4FF" }}>
            <Search size={13} color="#94A3B8" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 text-xs outline-none bg-transparent font-heading"
              style={{ color: "#0F172A" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : scores.length === 0 ? (
              <StatusMessages />
            ) : sortedScores.map((score, i) => {
              const isSelected = selected?.quartier_id === score.quartier_id
              return (
                <Card
                  key={score.quartier_id}
                  niveau={score.niveau}
                  interactive
                  onClick={() => setSelected(score)}
                  className="p-3 animate-fadeInUp"
                  style={{
                    animationDelay: `${Math.min(i * 20, 300)}ms`,
                    ...(isSelected ? { background: niveauBg[score.niveau], borderColor: niveauColor[score.niveau] + "50" } : {})
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold font-heading" style={{ color: "#0F172A" }}>{score.nom}</span>
                    <Badge niveau={score.niveau} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full h-1 rounded-full mr-3" style={{ background: "#E2E8F0" }}>
                      <div className="h-1 rounded-full" style={{ width: `${score.score}%`, background: niveauColor[score.niveau] }} />
                    </div>
                    <AnimatedNumber value={score.score} className="text-sm font-bold flex-shrink-0 font-mono" style={{ color: niveauColor[score.niveau] }} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-mono" style={{ color: "#94A3B8" }}>
                      <Droplets size={10} className="inline mr-0.5" style={{ color: "#0EA5E9" }} />
                      {score.pluie_6h}mm
                    </span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      <Clock size={10} className="inline mr-0.5" />
                      {formatTime(score.calculated_at)}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {selected && (
          <Card niveau={selected.niveau} className="flex-shrink-0 m-3 mt-0 p-4 animate-fadeInUp">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-base mb-1 font-heading" style={{ color: "#0F172A" }}>{selected.nom}</h3>
                <Badge niveau={selected.niveau} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <AnimatedNumber value={selected.score} className="font-bold text-3xl font-mono" style={{ color: niveauColor[selected.niveau] }} />
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
                <div key={label} className="rounded-squircle p-2.5 text-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>{label}</p>
                  <p className="text-sm font-bold font-mono" style={{ color: niveauColor[selected.niveau] }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}