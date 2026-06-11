"use client"

import { useState, useEffect } from "react"
import { signalementsAPI } from "@/lib/api"
import { subscribeToSignalements } from "@/lib/supabase"
import { Signalement } from "@/types"

export function useSignalements() {
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSignalements = async () => {
    try {
      const data = await signalementsAPI.getTous()
      setSignalements(data.signalements)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignalements()

    // Rafraîchissement toutes les 2 minutes
    const interval = setInterval(fetchSignalements, 2 * 60 * 1000)

    // Realtime Supabase
    const subscription = subscribeToSignalements((payload) => {
      setSignalements(prev => [payload.new as Signalement, ...prev])
    })

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  return { signalements, loading, error, refetch: fetchSignalements }
}