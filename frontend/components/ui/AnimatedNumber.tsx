"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
  style?: React.CSSProperties
}

export function AnimatedNumber({ value, duration = 900, decimals = 0, className, style }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    let raf: number
    startRef.current = null

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(2, -10 * progress)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
      else setDisplay(value)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span className={className} style={style}>
      {display.toFixed(decimals)}
    </span>
  )
}