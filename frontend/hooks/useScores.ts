"use client"

import { useState, useEffect, useCallback } from "react"
import { scoresAPI } from "@/lib/api"
import { subscribeToScores } from "@/lib/supabase"
import { ScoreRisque } from "@/types"

// Seuil au-delà duquel les données sont considérées périmées (8 min)
const STALE_THRESHOLD_MS = 8 * 60 * 1000

export type ConnectionStatus = "live" | "stale" | "offline"

export function useScores() {
  const [scores, setScores] = useState<ScoreRisque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("live")

  const fetchScores = useCallback(async () => {
    try {
      const data = await scoresAPI.getTous()

      // Garde uniquement le score le plus récent par quartier
      const deduped = Object.values(
        data.scores.reduce((acc: Record<string, any>, score: any) => {
          const existing = acc[score.quartier_id]
          if (!existing || new Date(score.calculated_at) > new Date(existing.calculated_at)) {
            acc[score.quartier_id] = score
          }
          return acc
        }, {})
      )

      setScores(deduped as ScoreRisque[])
      setLastUpdate(new Date())
      setStatus("live")
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setStatus("offline")
    } finally {
      setLoading(false)
    }
  }, [])

  // Vérifie la fraîcheur des données toutes les 30s
  useEffect(() => {
    const stalenessCheck = setInterval(() => {
      if (!lastUpdate) return
      const age = Date.now() - lastUpdate.getTime()
      if (age > STALE_THRESHOLD_MS) {
        setStatus("stale")
      }
    }, 30 * 1000)

    return () => clearInterval(stalenessCheck)
  }, [lastUpdate])

  useEffect(() => {
    fetchScores()

    // Rafraîchissement toutes les 5 minutes
    const interval = setInterval(fetchScores, 5 * 60 * 1000)

    // Realtime Supabase
    const subscription = subscribeToScores(() => {
      fetchScores()
    })

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [fetchScores])

  return { scores, loading, error, lastUpdate, status, refetch: fetchScores }
}