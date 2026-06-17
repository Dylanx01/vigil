"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { ScoreRisque } from "@/types"
import { Box, Layers } from "lucide-react"

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

const niveauLabels = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  critique: "Critique"
}

const niveauOrder: Array<keyof typeof niveauColor> = ["faible", "modere", "eleve", "critique"]

// Hauteur des mini-tours dans la légende (px)
const towerHeights = {
  faible: 8,
  modere: 14,
  eleve: 20,
  critique: 28
}

// Hauteur en mètres : score 0-100 -> 100m à 4100m, exagéré pour visibilité à zoom 12-13
const scoreToHeight = (score: number) => 100 + score * 40

const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)"
}

export function MapVigil({ scores, onQuartierClick, userLocation }: MapVigilProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [is3D, setIs3D] = useState(true)
  const [legendExpanded, setLegendExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState<keyof typeof niveauColor | null>(null)

  // Compteurs live par niveau, pour la légende
  const niveauCounts = useMemo(() => {
    const counts: Record<string, number> = { faible: 0, modere: 0, eleve: 0, critique: 0 }
    scores.forEach(s => {
      if (counts[s.niveau] !== undefined) counts[s.niveau]++
    })
    return counts
  }, [scores])

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

  // Mise à jour couleur + hauteur + opacité selon les scores ET le filtre actif
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

      let opacity: number = niveauOpacity[score.niveau]
      if (activeFilter) {
        opacity = score.niveau === activeFilter
          ? Math.min(opacity + 0.15, 1)
          : 0.08
      }
      opacityExpression.push(score.quartier_id, opacity)
    })

    colorExpression.push("#10B981")
    heightExpression.push(40)
    opacityExpression.push(activeFilter ? 0.08 : 0.55)

    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-color", colorExpression)
    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-height", heightExpression)
    map.setPaintProperty("quartiers-extrusion", "fill-extrusion-opacity", activeFilter ? 0.85 : 0.55)

  }, [scores, mapLoaded, activeFilter])

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

  const toggleFilter = (niveau: keyof typeof niveauColor) => {
    setActiveFilter(prev => (prev === niveau ? null : niveau))
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
            ...glassStyle,
            color: is3D ? "#0EA5E9" : "#FFFFFF"
          }}
          aria-label="Basculer vue 2D/3D"
        >
          <Box size={16} />
        </button>
      )}

      {/* Légende interactive */}
      {mapLoaded && (
        <div className="absolute z-10 top-28 right-4 md:top-4 flex flex-col items-end gap-2">
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
            style={glassStyle}
          >
            <Layers size={14} color="#FFFFFF" />
            <span className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>
              Légende
            </span>
          </button>

          {legendExpanded && (
            <div className="rounded-xl p-2 flex flex-col gap-1 w-48" style={glassStyle}>
              {niveauOrder.map(niveau => {
                const isActive = activeFilter === niveau
                const isDimmed = activeFilter !== null && !isActive

                return (
                  <button
                    key={niveau}
                    onClick={() => toggleFilter(niveau)}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                      opacity: isDimmed ? 0.4 : 1
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-end h-7 w-3 flex-shrink-0">
                        <div
                          className="w-full rounded-sm"
                          style={{ height: `${towerHeights[niveau]}px`, background: niveauColor[niveau] }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#FFFFFF" }}>
                        {niveauLabels[niveau]}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: niveauColor[niveau], fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {niveauCounts[niveau]}
                    </span>
                  </button>
                )
              })}

              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs font-medium mt-1 py-1 rounded-lg transition-colors"
                  style={{ color: "#94A3B8" }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
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
          bottom: 16px;
          left: 16px;
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