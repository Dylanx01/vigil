"use client"

import { LiveBadge } from "@/components/ui/LiveBadge"
import { LangSwitcher } from "@/components/ui/LangSwitcher"
import { Shield, User, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/useLanguage"
import Link from "next/link"

interface NavbarProps {
  lastUpdate?: Date | null
}

export function Navbar({ lastUpdate }: NavbarProps) {
  const { isAuthenticated, role, logout, mounted } = useAuth()
  const { t } = useLanguage()

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
          className="font-bold text-base tracking-tight"
          style={{ color: "var(--text-inverse)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Vigil
        </span>
      </div>

      {/* Live badge */}
      <LiveBadge lastUpdate={lastUpdate} />

      {/* Actions droite */}
      <div className="flex items-center gap-3">

        {/* Switcher langue */}
        <LangSwitcher />

        {mounted && isAuthenticated && role === "citoyen" ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profil"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
            >
              <User size={12} />
              {t.profil.titre}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/connexion"
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
            >
              {t.nav.connexion}
            </Link>
            <Link
              href="/mairie/login"
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {t.nav.portailMairie}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}