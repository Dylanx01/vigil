"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Map, Bell, AlertTriangle, BarChart2, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated, role, mounted } = useAuth()

  const navItems = [
    { href: "/", icon: Map, label: "Carte" },
    { href: "/alertes", icon: Bell, label: "Alertes" },
    { href: "/signaler", icon: AlertTriangle, label: "Signaler" },
    { href: "/stats", icon: BarChart2, label: "Stats" },
    ...(mounted && isAuthenticated && role === "citoyen"
      ? [{ href: "/profil", icon: User, label: "Profil" }]
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