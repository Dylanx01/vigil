import type { Metadata } from "next"
import type { Viewport } from "next"
import { Toaster } from "react-hot-toast"
import { LanguageProvider } from "@/lib/i18n-context"
import "./globals.css"
import "maplibre-gl/dist/maplibre-gl.css"

export const metadata: Metadata = {
  title: "Vigil — Système d'alerte précoce aux inondations",
  description: "Anticipez les inondations à Douala en temps réel. Carte des risques, signalements citoyens et alertes SMS.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vigil",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Vigil — Alerte inondations Douala",
    description: "Anticipez. Avant que l'eau parle.",
    type: "website",
    images: [{ url: "/icon-512.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vigil" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Vigil" />
        <meta name="msapplication-TileImage" content="/icon-512.png" />
        <meta name="msapplication-TileColor" content="#0EA5E9" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif", margin: 0, padding: 0 }}>
        <LanguageProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#FFFFFF",
                color: "#0F172A",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                padding: "12px 16px",
              },
              success: { iconTheme: { primary: "#10B981", secondary: "white" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
            }}
          />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}