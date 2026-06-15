"use client"

import { useState, useEffect } from "react"
import { Radar } from "lucide-react"

const MESSAGES = [
  "Connexion aux capteurs météo...",
  "Analyse pluviométrique Douala...",
  "Calcul des scores de risque...",
]

export function StatusMessages() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-12 h-12 rounded-squircle-lg flex items-center justify-center animate-breathe" style={{ background: "#EFF6FF" }}>
        <Radar size={22} style={{ color: "#0EA5E9" }} />
      </div>
      <p key={index} className="text-sm font-medium animate-fadeInUp font-heading" style={{ color: "#64748B" }}>
        {MESSAGES[index]}
      </p>
    </div>
  )
}