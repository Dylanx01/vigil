"use client"

import { useEffect, useRef, useState } from "react"
import { ScoreRisque } from "@/types"

interface MapVigilProps {
  scores: ScoreRisque[]
  onQuartierClick?: (score: ScoreRisque) => void
}

const niveauColor = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

const niveauOpacity = {
  faible: 0.35,
  modere: 0.50,
  eleve: 0.65,
  critique: 0.80
}

export function MapVigil({ scores, onQuartierClick }: MapVigilProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [9.7679, 4.0511],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        attributionControl: false
      })

      // Contrôles zoom — positionnés à gauche pour ne pas déborder
      map.addControl(new maplibregl.NavigationControl({
        showCompass: false
      }), "bottom-left")

      // Attribution minimaliste
      map.addControl(new maplibregl.AttributionControl({
        compact: true
      }), "bottom-right")

      map.on("load", async () => {
        try {
          const response = await fetch("/polygones.geojson")
          const geojson = await response.json()

          map.addSource("quartiers", {
            type: "geojson",
            data: geojson
          })

          map.addLayer({
            id: "quartiers-fill",
            type: "fill",
            source: "quartiers",
            paint: {
              "fill-color": "#10B981",
              "fill-opacity": 0.35
            }
          })

          map.addLayer({
            id: "quartiers-border",
            type: "line",
            source: "quartiers",
            paint: {
              "line-color": "#FFFFFF",
              "line-opacity": 0.4,
              "line-width": 1
            }
          })

          map.on("click", "quartiers-fill", (e: any) => {
            const feature = e.features?.[0]
            if (!feature) return
            const quartierScore = scores.find(s => s.quartier_id === feature.properties.id)
            if (quartierScore && onQuartierClick) {
              onQuartierClick(quartierScore)
            }
          })

          map.on("mouseenter", "quartiers-fill", () => {
            map.getCanvas().style.cursor = "pointer"
          })

          map.on("mouseleave", "quartiers-fill", () => {
            map.getCanvas().style.cursor = ""
          })

        } catch (err) {
          console.error("Erreur chargement polygones:", err)
        }

        mapRef.current = map
        setMapLoaded(true)
      })
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || scores.length === 0) return

    const map = mapRef.current

    if (!map.getLayer("quartiers-fill")) return

    const colorExpression: any[] = ["match", ["get", "id"]]
    scores.forEach(score => {
      colorExpression.push(score.quartier_id, niveauColor[score.niveau])
    })
    colorExpression.push("#10B981")

    const opacityExpression: any[] = ["match", ["get", "id"]]
    scores.forEach(score => {
      opacityExpression.push(score.quartier_id, niveauOpacity[score.niveau])
    })
    opacityExpression.push(0.35)

    map.setPaintProperty("quartiers-fill", "fill-color", colorExpression)
    map.setPaintProperty("quartiers-fill", "fill-opacity", opacityExpression)

  }, [scores, mapLoaded])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
          style={{ background: "#0F172A" }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#0EA5E9", borderTopColor: "transparent" }}
          />
          <span className="text-sm" style={{ color: "#64748B" }}>
            Chargement de la carte...
          </span>
        </div>
      )}

      {/* CSS pour repositionner les contrôles MapLibre */}
      <style>{`
        .maplibregl-ctrl-bottom-left {
          bottom: 16px !important;
          left: 16px !important;
        }
        .maplibregl-ctrl-bottom-right {
          bottom: 8px !important;
          right: 8px !important;
        }
        .maplibregl-ctrl-group {
          background: rgba(255,255,255,0.12) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .maplibregl-ctrl-group button {
          background: transparent !important;
          color: white !important;
          width: 36px !important;
          height: 36px !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        .maplibregl-ctrl-group button + button {
          border-top: 1px solid rgba(255,255,255,0.1) !important;
        }
        .maplibregl-ctrl-attrib {
          background: rgba(0,0,0,0.4) !important;
          color: rgba(255,255,255,0.5) !important;
          font-size: 9px !important;
          border-radius: 4px !important;
        }
        .maplibregl-ctrl-attrib a {
          color: rgba(255,255,255,0.5) !important;
        }
      `}</style>
    </div>
  )
}