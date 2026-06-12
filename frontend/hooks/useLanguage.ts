"use client"

import { useState, useEffect } from "react"
import { translations, Locale, Translations } from "@/lib/i18n"

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>("fr")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vigil_locale") as Locale
      if (saved && (saved === "fr" || saved === "en")) {
        setLocale(saved)
      }
    } catch {}
  }, [])

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    try {
      localStorage.setItem("vigil_locale", newLocale)
    } catch {}
  }

  const t: Translations = translations[locale]

  return { locale, switchLanguage, t }
}