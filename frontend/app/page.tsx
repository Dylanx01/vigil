"use client"

import { useState, useRef, useEffect } from "react"
import { MapVigil } from "@/components/carte/MapVigil"
import { BottomNav } from "@/components/layout/BottomNav"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Badge } from "@/components/ui/Badge"
import { useScores } from "@/hooks/useScores"
import { ScoreRisque } from "@/types"
import { Droplets, Clock, X, Shield, ChevronUp, AlertTriangle, Search } from "lucide-react"

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

export default function HomePage() {
  const { scores, loading, lastUpdate } = useScores()
  const [selected, setSelected] = useState<ScoreRisque | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const sortedScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .filter(s => s.nom.toLowerCase().includes(searchQuery.toLowerCase()))

  const alertCount = scores.filter(s => s.niveau === "eleve" || s.niveau === "critique").length

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "—"
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return "À l'instant"
    if (diff < 60) return `${diff} min`
    return `${Math.floor(diff / 60)}h`
  }

  return (
    <div
      className="relative w-screen overflow-hidden"
      style={{ height: "100dvh", background: "#F0F4FF" }}
    >
      {/* Desktop layout */}
      <div className="hidden md:block">
        <Navbar lastUpdate={lastUpdate} />
        <Sidebar />
      </div>

      {/* Carte plein écran */}
      <div className="absolute inset-0 md:left-56 md:top-14" style={{ bottom: "72px" }}>
        <MapVigil
          scores={scores}
          onQuartierClick={(score) => {
            setSelected(score)
            setSheetExpanded(false)
          }}
        />
      </div>

      {/* Header mobile flottant */}
      <div className="absolute top-0 left-0 right-0 z-30 md:hidden">
        <div
          className="mx-4 mt-12 flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#0EA5E9" }}
            >
              <Shield size={15} color="white" />
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Vigil
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium" style={{ color: "#64748B" }}>
              En direct
            </span>
            {lastUpdate && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#F0F4FF", color: "#64748B" }}
              >
                {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          {alertCount > 0 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: "#FEF2F2" }}
            >
              <AlertTriangle size={11} color="#EF4444" />
              <span className="text-xs font-bold" style={{ color: "#EF4444" }}>
                {alertCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detail quartier — bottom sheet sélection */}
      {selected && !sheetExpanded && (
        <div
          className="absolute left-4 right-4 z-40 md:hidden animate-fadeIn"
          style={{ bottom: "84px" }}
        >
          <div
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.12)",
              borderTop: `3px solid ${niveauColor[selected.niveau]}`
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2
                  className="text-xl font-bold mb-1.5"
                  style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {selected.nom}
                </h2>
                <Badge niveau={selected.niveau} size="sm" />
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#F0F4FF" }}
              >
                <X size={14} color="#94A3B8" />
              </button>
            </div>

            {/* Score */}
            <div className="flex items-end gap-2 mb-3">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "3.5rem",
                  lineHeight: 1,
                  color: niveauColor[selected.niveau],
                  letterSpacing: "-0.03em",
                  fontWeight: 700
                }}
              >
                {selected.score.toFixed(0)}
              </span>
              <span
                className="text-base mb-2"
                style={{ color: "#94A3B8" }}
              >
                /100
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-1.5 rounded-full mb-4"
              style={{ background: "#F0F4FF" }}
            >
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${selected.score}%`,
                  background: niveauColor[selected.niveau]
                }}
              />
            </div>

            {/* Stats */}
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
                  <p
                    className="text-xs mb-1"
                    style={{ color: "#94A3B8" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: niveauColor[selected.niveau],
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet — liste quartiers */}
      <div
        className="absolute left-0 right-0 z-30 md:hidden transition-all duration-300"
        style={{
          bottom: "64px",
          height: sheetExpanded ? "70vh" : "auto"
        }}
      >
        <div
          className="rounded-t-3xl overflow-hidden flex flex-col"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.10)",
            height: sheetExpanded ? "100%" : "auto",
            maxHeight: sheetExpanded ? "100%" : "180px"
          }}
        >
          {/* Handle + header */}
          <div
            className="px-5 pt-3 pb-3 flex-shrink-0"
            onClick={() => {
              setSheetExpanded(!sheetExpanded)
              setSelected(null)
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#E2E8F0" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Quartiers de Douala
                </p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {loading ? "Chargement..." : `${scores.length} zones surveillées`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {alertCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: "#FEF2F2", color: "#EF4444" }}
                  >
                    {alertCount} alerte{alertCount > 1 ? "s" : ""}
                  </span>
                )}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    background: "#F0F4FF",
                    transform: sheetExpanded ? "rotate(180deg)" : "rotate(0deg)"
                  }}
                >
                  <ChevronUp size={14} color="#64748B" />
                </div>
              </div>
            </div>
          </div>

          {/* Search — visible seulement si expanded */}
          {sheetExpanded && (
            <div className="px-4 pb-3 flex-shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "#F0F4FF" }}
              >
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

          {/* Liste */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#0EA5E9", borderTopColor: "transparent" }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedScores.map(score => (
                  <button
                    key={score.quartier_id}
                    onClick={() => {
                      setSelected(score)
                      setSheetExpanded(false)
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: selected?.quartier_id === score.quartier_id
                        ? niveauBg[score.niveau]
                        : "#F8FAFC",
                      border: `1px solid ${selected?.quartier_id === score.quartier_id
                        ? niveauColor[score.niveau] + "40"
                        : "transparent"}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: niveauColor[score.niveau] }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {score.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge niveau={score.niveau} size="sm" />
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: niveauColor[score.niveau],
                          fontFamily: "'JetBrains Mono', monospace",
                          minWidth: "32px",
                          textAlign: "right"
                        }}
                      >
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

      {/* Panel desktop droit */}
      <div
        className="hidden md:flex absolute right-0 top-14 bottom-0 w-80 flex-col"
        style={{
          background: "#FFFFFF",
          borderLeft: "1px solid #E2E8F0"
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <h2
            className="font-bold text-sm"
            style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Quartiers de Douala
          </h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>
            {scores.length} zones
          </span>
        </div>

        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderBottom: "1px solid #F0F4FF" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#F0F4FF" }}
          >
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
                <div
                  key={i}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ background: "#F0F4FF" }}
                />
              ))
            ) : sortedScores.map(score => (
              <button
                key={score.quartier_id}
                onClick={() => setSelected(score)}
                className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: selected?.quartier_id === score.quartier_id
                    ? niveauBg[score.niveau]
                    : "#F8FAFC",
                  borderLeft: `3px solid ${niveauColor[score.niveau]}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {score.nom}
                  </span>
                  <Badge niveau={score.niveau} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className="w-full h-1 rounded-full mr-3"
                    style={{ background: "#E2E8F0" }}
                  >
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${score.score}%`,
                        background: niveauColor[score.niveau]
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold flex-shrink-0"
                    style={{
                      color: niveauColor[score.niveau],
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
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
      </div>

      {/* Bottom nav mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}