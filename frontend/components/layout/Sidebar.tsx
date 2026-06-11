"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Map, Bell, AlertTriangle, BarChart2, Shield } from "lucide-react"

const navItems = [
  { href: "/", icon: Map, label: "Carte" },
  { href: "/alertes", icon: Bell, label: "Alertes" },
  { href: "/signaler", icon: AlertTriangle, label: "Signaler" },
  { href: "/stats", icon: BarChart2, label: "Statistiques" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-56 z-40"
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
              style={{
                background: active ? "rgba(14,165,233,0.15)" : "transparent",
                color: active ? "var(--brand)" : "var(--text-muted)"
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-sidebar-hover)"
                  e.currentTarget.style.color = "var(--text-inverse)"
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "var(--text-muted)"
                }
              }}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Shield size={12} color="white" />
          </div>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--text-inverse)" }}
            >
              Vigil
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}