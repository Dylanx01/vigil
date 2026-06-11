"use client"

import { useState, useEffect } from "react"
import { scoresAPI } from "@/lib/api"
import { subscribeToScores } from "@/lib/supabase"
import { ScoreRisque } from "@/types"

export function useScores() {
  const [scores, setScores] = useState<ScoreRisque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchScores = async () => {
    try {
      const data = await scoresAPI.getTous()
      setScores(data.scores)
      setLastUpdate(new Date())
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
  }, [])

  return { scores, loading, error, lastUpdate, refetch: fetchScores }
}