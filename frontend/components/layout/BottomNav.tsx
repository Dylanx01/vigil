"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Map, Bell, AlertTriangle, BarChart2, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/useLanguage"

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated, role, mounted } = useAuth()
  const { t } = useLanguage()

  const navItems = [
    { href: "/", icon: Map, label: t.nav.carte },
    { href: "/alertes", icon: Bell, label: t.nav.alertes },
    { href: "/signaler", icon: AlertTriangle, label: t.nav.signaler },
    { href: "/stats", icon: BarChart2, label: t.nav.stats },
    ...(mounted && isAuthenticated && role === "citoyen"
      ? [{ href: "/profil", icon: User, label: t.nav.profil }]
      : []
    ),
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 md:hidden"
      style={{
        background: "var(--bg-sidebar)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
            style={{ color: active ? "var(--brand)" : "var(--text-muted)" }}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}