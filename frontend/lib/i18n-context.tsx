"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { translations, Locale, Translations } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  switchLanguage: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  switchLanguage: () => {},
  t: translations["fr"]
})

export function LanguageProvider({ children }: { children: ReactNode }) {
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

  return (
    <LanguageContext.Provider value={{ locale, switchLanguage, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}