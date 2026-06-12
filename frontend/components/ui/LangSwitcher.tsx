"use client"

import { useLanguage } from "@/hooks/useLanguage"

export function LangSwitcher() {
  const { locale, switchLanguage } = useLanguage()

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {(["fr", "en"] as const).map(lang => (
        <button
          key={lang}
          onClick={() => switchLanguage(lang)}
          className="px-2.5 py-1 text-xs font-semibold uppercase transition-all"
          style={{
            background: locale === lang
              ? "var(--brand)"
              : "transparent",
            color: locale === lang
              ? "white"
              : "var(--text-muted)"
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}