"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { MapVigil } from "@/components/carte/MapVigil"
import { PopupQuartier } from "@/components/carte/PopupQuartier"
import { ScoreCard } from "@/components/ui/ScoreCard"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { useScores } from "@/hooks/useScores"
import { ScoreRisque } from "@/types"
import { WifiOff } from "lucide-react"

export default function HomePage() {
  const { scores, loading, error, lastUpdate } = useScores()
  const [selectedQuartier, setSelectedQuartier] = useState<ScoreRisque | null>(null)

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar lastUpdate={lastUpdate} />

      {/* Sidebar desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="pt-14 md:pl-56 pb-16 md:pb-0 h-screen flex flex-col md:flex-row">

        {/* Carte — zone principale */}
        <div className="relative flex-1 h-64 md:h-full">
          {error ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{ background: "#0F172A" }}
            >
              <WifiOff size={32} style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Données temporairement indisponibles
              </p>
            </div>
          ) : (
            <MapVigil
              scores={scores}
              onQuartierClick={setSelectedQuartier}
            />
          )}

          {/* Popup quartier */}
          {selectedQuartier && (
            <PopupQuartier
              score={selectedQuartier}
              onClose={() => setSelectedQuartier(null)}
            />
          )}
        </div>

        {/* Panel droit — liste scores */}
        <div
          className="w-full md:w-80 flex flex-col"
          style={{
            background: "var(--bg-primary)",
            borderLeft: "1px solid var(--border)"
          }}
        >
          {/* Header panel */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2
              className="font-heading font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Quartiers de Douala
            </h2>
            <span
              className="mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {scores.length} zones
            </span>
          </div>

          {/* Liste scores */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-2"
              >
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Impossible de charger les données
                </p>
              </div>
            ) : (
              scores
                .sort((a, b) => b.score - a.score)
                .map(score => (
                  <ScoreCard
                    key={score.quartier_id}
                    score={score}
                    onClick={() => setSelectedQuartier(score)}
                  />
                ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  )
}