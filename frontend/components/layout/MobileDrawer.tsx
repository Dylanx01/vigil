"use client"

import { useEffect } from "react"
import { LangSwitcher } from "@/components/ui/LangSwitcher"
import { Shield, User, LogOut, X, Building2, LogIn } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/useLanguage"
import Link from "next/link"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  lastUpdate?: Date | null
}

export function MobileDrawer({ open, onClose, lastUpdate }: MobileDrawerProps) {
  const { isAuthenticated, role, logout, mounted } = useAuth()
  const { t } = useLanguage()

  // Empêche le scroll du body quand le drawer est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Overlay flou */}
      <div
        onClick={onClose}
        className="md:hidden fixed inset-0 z-[60] transition-opacity duration-300"
        style={{
          background: "rgba(2,6,23,0.55)",
          backdropFilter: open ? "blur(4px)" : "none",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none"
        }}
      />

      {/* Panneau */}
      <div
        className="md:hidden fixed top-0 right-0 bottom-0 z-[70] w-[78%] max-w-[320px] flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          transform: open ? "translateX(0)" : "translateX(100%)"
        }}
      >
        {/* Header drawer */}
        <div
          className="flex items-center justify-between px-5 h-14 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
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
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-label="Fermer"
          >
            <X size={18} color="var(--text-inverse)" />
          </button>
        </div>

        {/* Statut système */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex w-2 h-2">
              <span
                className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                style={{ background: "#10B981" }}
              />
              <span
                className="relative inline-flex w-2 h-2 rounded-full"
                style={{ background: "#10B981" }}
              />
            </span>
            <span className="text-xs font-semibold" style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>
              SYSTÈME EN LIGNE
            </span>
          </div>
          {lastUpdate && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* Compte */}
        <div className="px-5 py-4 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {mounted && isAuthenticated && role === "citoyen" ? (
            <>
              <Link
                href="/profil"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "rgba(14,165,233,0.12)", color: "var(--brand)" }}
              >
                <User size={16} />
                {t.profil.titre}
              </Link>
              <button
                onClick={() => { logout(); onClose() }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              style={{ background: "rgba(14,165,233,0.12)", color: "var(--brand)" }}
            >
              <LogIn size={16} />
              {t.nav.connexion}
            </Link>
          )}

          <Link
            href="/mairie/login"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-inverse)" }}
          >
            <Building2 size={16} />
            {t.nav.portailMairie}
          </Link>
        </div>

        {/* Langue */}
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Langue / Language
          </span>
          <LangSwitcher />
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="px-5 py-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            Vigil · Douala 2026
          </span>
        </div>
      </div>
    </>
  )
}