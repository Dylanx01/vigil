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
  faible: 0.3,
  modere: 0.45,
  eleve: 0.6,
  critique: 0.75
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
      })

      map.addControl(new maplibregl.NavigationControl(), "top-right")

      map.on("load", async () => {
        // Chargement polygones GeoJSON
        const response = await fetch("/polygones.geojson")
        const geojson = await response.json()

        map.addSource("quartiers", {
          type: "geojson",
          data: geojson
        })

        // Couche remplissage
        map.addLayer({
          id: "quartiers-fill",
          type: "fill",
          source: "quartiers",
          paint: {
            "fill-color": "#10B981",
            "fill-opacity": 0.3
          }
        })

        // Couche bordure
        map.addLayer({
          id: "quartiers-border",
          type: "line",
          source: "quartiers",
          paint: {
            "line-color": "#FFFFFF",
            "line-opacity": 0.3,
            "line-width": 1
          }
        })

        // Click sur quartier
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

  // Mise à jour couleurs quand scores changent
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || scores.length === 0) return

    const map = mapRef.current

    // Couleurs dynamiques par score
    const colorExpression: any[] = ["match", ["get", "id"]]

    scores.forEach(score => {
      colorExpression.push(score.quartier_id, niveauColor[score.niveau])
    })

    colorExpression.push("#10B981") // couleur par défaut

    const opacityExpression: any[] = ["match", ["get", "id"]]

    scores.forEach(score => {
      opacityExpression.push(score.quartier_id, niveauOpacity[score.niveau])
    })

    opacityExpression.push(0.3)

    map.setPaintProperty("quartiers-fill", "fill-color", colorExpression)
    map.setPaintProperty("quartiers-fill", "fill-opacity", opacityExpression)

  }, [scores, mapLoaded])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "#0F172A" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Chargement de la carte...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}