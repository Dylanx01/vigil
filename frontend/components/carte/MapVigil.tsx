"use client"

import { useEffect, useRef, useState } from "react"
import { ScoreRisque } from "@/types"
import { Box } from "lucide-react"

interface MapVigilProps {
  scores: ScoreRisque[]
  onQuartierClick?: (score: ScoreRisque) => void
  userLocation?: { lat: number; lng: number } | null
}

const niveauColor = {
  faible: "#10B981",
  modere: "#F59E0B",
  eleve: "#EF4444",
  critique: "#7C3AED"
}

const niveauOpacity = {
  faible: 0.55,
  modere: 0.65,
  eleve: 0.75,
  critique: 0.85
}

// Hauteur en mètres : score 0-100 -> 40m à 440m, pour une skyline lisible
const scoreToHeight = (score: number) => 100 + score * 40

export function MapVigil({ scores, onQuartierClick, userLocation }: MapVigilProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [is3D, setIs3D] = useState(true)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [9.7679, 4.0511],
        zoom: 12,
        pitch: 50,
        bearing: -12,
        minZoom: 10,
        maxZoom: 18,
        maxPitch: 70,
        attributionControl: false
      })

      // Contrôles zoom — positionnés à gauche pour ne pas déborder
      map.addControl(new maplibregl.NavigationControl({
        showCompass: true,
        visualizePitch: true
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

          // Footprint au sol (contour des quartiers)
          map.addLayer({
            id: "quartiers-border",
            type: "line",
            source: "quartiers",
            paint: {
              "line-color": "#FFFFFF",
              "line-opacity": 0.35,
              "line-width": 1
            }
          })

          // Extrusion 3D — hauteur = niveau de risque
          map.addLayer({
            id: "quartiers-extrusion",
            type: "fill-extrusion",
            source: "quartiers",
            paint: {
              "fill-extrusion-color": "#10B981",
              "fill-extrusion-opacity": 0.55,
              "fill-extrusion-height": 40,
              "fill-extrusion-base": 0,
              "fill-extrusion-vertical-gradient": true,
              "fill-extrusion-height-transition": { duration: 800, delay: 0 },
              "fill-extrusion-color-transition": { duration: 800, delay: 0 },
              "fill-extrusion-opacity-transition": { duration: 800, delay: 0 }
            }
          })

          map.on("click", "quartiers-extrusion", (e: any) => {
            const feature = e.features?.[0]
            if (!feature) return
            const quartierScore = scores.find(s => s.quartier_id === feature.properties.id)
            if (quartierScore && onQuartierClick) {
              onQuartierClick(quartierScore)
            }
          })

          map.on("mouseenter", "quartiers-extrusion", () => {
            map.getCanvas().style.cursor = "pointer"
          })

          map.on("mouseleave", "quartiers-extrusion", () => {
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
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Mise à jour couleur + hauteur + opacité selon les scores
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || scores.length === 0) return

    const map = mapRef.current

    if (!map.getLayer("quartiers-extrusion")) return

    const colorExpression: any[] = ["match", ["get", "id"]]
    const heightExpression: any[] = ["match", ["get", "id"]]
    const opacityExpression: any[] = ["match", ["get", "id"]]

    scores.forEach(score => {
      colorExpression.push(score.quartier_id, niveauColor[score.niveau])
      heightExpression.push(score.quartier_id, scoreToHeight(score.score))
      opacityExpression.push(score.quartier_id, niveauOpacity[score.niveau])
    })

    colorExpression.push("#10B981")
    heightExpression.push(40)
    opacityExpression.push(0.55)

    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-color", colorExpression)
    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-height", heightExpression)
    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-opacity", opacityExpression)

  }, [scores, mapLoaded])

  // Gestion du marqueur de position utilisateur + centrage carte
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current

    if (
      !userLocation ||
      typeof userLocation.lat !== "number" ||
      typeof userLocation.lng !== "number" ||
      isNaN(userLocation.lat) ||
      isNaN(userLocation.lng)
    ) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      return
    }

    const setupMarker = async () => {
      const maplibregl = (await import("maplibre-gl")).default

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat])
      } else {
        const el = document.createElement("div")
        el.style.width = "20px"
        el.style.height = "20px"
        el.style.position = "relative"

        el.innerHTML = `
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.35);
            animation: vigil-pulse 2s ease-out infinite;
          "></div>
          <div style="
            position: absolute;
            top: 5px;
            left: 5px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #0EA5E9;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 6px rgba(14, 165, 233, 0.8);
          "></div>
        `

        userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map)
      }

      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1200
      })
    }

    setupMarker()
  }, [userLocation, mapLoaded])

  const toggle3D = () => {
    if (!mapRef.current) return
    const next = !is3D
    mapRef.current.easeTo({
      pitch: next ? 50 : 0,
      bearing: next ? -12 : 0,
      duration: 700
    })
    setIs3D(next)
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ position: "absolute", inset: 0 }}
      />

     {/* Toggle 2D / 3D */}
{mapLoaded && (
  <button
    onClick={toggle3D}
    className="absolute z-10 flex items-center justify-center w-9 h-9 rounded-xl transition-colors bottom-44 left-4 md:bottom-[104px] md:left-4"
    style={{
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: is3D ? "#0EA5E9" : "#FFFFFF"
    }}
    aria-label="Basculer vue 2D/3D"
  >
    <Box size={16} />
  </button>
)}

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

      {/* CSS pour repositionner les contrôles MapLibre + animation pulse */}
      <style>{`
        @keyframes vigil-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }

        @media (max-width: 767px) {
  .maplibregl-ctrl-bottom-left {
    bottom: 256px !important;
    left: 16px !important;
  }
}
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