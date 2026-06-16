"use client"

import { useState } from "react"
import { LiveBadge } from "@/components/ui/LiveBadge"
import { LangSwitcher } from "@/components/ui/LangSwitcher"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { User, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/useLanguage"
import { ConnectionStatus } from "@/hooks/useScores"
import Link from "next/link"

interface NavbarProps {
  lastUpdate?: Date | null
  status?: ConnectionStatus
  onRetry?: () => void
}

export function Navbar({ lastUpdate, status = "live", onRetry }: NavbarProps) {
  const { isAuthenticated, role, logout, mounted } = useAuth()
  const { t } = useLanguage()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14"
        style={{
          background: "var(--bg-sidebar)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.svg" alt="Vigil" width={32} height={32} />
          <span
            className="font-bold text-base tracking-tight font-heading"
            style={{ color: "var(--text-inverse)" }}
          >
            Vigil
          </span>
        </div>

        {/* Live badge */}
        <LiveBadge lastUpdate={lastUpdate} status={status} onRetry={onRetry} />

        {/* Actions droite — DESKTOP */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <LangSwitcher />

          {mounted && isAuthenticated && role === "citoyen" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profil"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-squircle text-xs font-medium font-heading"
                style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
              >
                <User size={12} />
                {t.profil.titre}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-squircle text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/connexion"
                className="text-xs font-medium px-3 py-1.5 rounded-squircle font-heading"
                style={{ background: "rgba(14,165,233,0.15)", color: "var(--brand)" }}
              >
                {t.nav.connexion}
              </Link>
              <Link
                href="/mairie/login"
                className="text-xs font-medium font-heading"
                style={{ color: "var(--text-muted)" }}
              >
                {t.nav.portailMairie}
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger — MOBILE */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-squircle transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-label="Menu"
        >
          <Menu size={18} color="var(--text-inverse)" />
        </button>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} lastUpdate={lastUpdate} />
    </>
  )
}