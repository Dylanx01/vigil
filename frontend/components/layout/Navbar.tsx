"use client"

import { LiveBadge } from "@/components/ui/LiveBadge"
import { Shield } from "lucide-react"

interface NavbarProps {
  lastUpdate?: Date | null
}

export function Navbar({ lastUpdate }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--brand)" }}
        >
          <Shield size={14} color="white" />
        </div>
        <span
          className="font-heading font-bold text-base tracking-tight"
          style={{ color: "var(--text-inverse)" }}
        >
          Vigil
        </span>
      </div>

      {/* Live badge */}
      <LiveBadge lastUpdate={lastUpdate} />

      {/* Portail mairie */}
      
    <a    href="/mairie/login"
        className="text-xs font-medium transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--brand)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        Portail mairie
      </a>
    </nav>
  )
}