"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { signalementsAPI } from "@/lib/api"
import { MapPin, Droplets, CheckCircle, AlertTriangle } from "lucide-react"

const QUARTIERS = [
  "makepe", "new-bell", "ndokotti", "bonamoussadi", "bonaberi",
  "deido", "akwa", "bonapriso", "logbessou", "ndog-bong", "bali",
  "kotto", "bassa", "pk8", "pk10", "pk14", "ndogpassi", "mboppi",
  "nkongmondo", "ange-raphael", "brazzaville", "mabanda", "sodiko",
  "yassa", "japoma"
]

const NOMS_QUARTIERS: Record<string, string> = {
  "makepe": "Makepe", "new-bell": "New Bell", "ndokotti": "Ndokotti",
  "bonamoussadi": "Bonamoussadi", "bonaberi": "Bonabéri", "deido": "Deido",
  "akwa": "Akwa", "bonapriso": "Bonapriso", "logbessou": "Logbessou",
  "ndog-bong": "Ndog-Bong", "bali": "Bali", "kotto": "Kotto",
  "bassa": "Bassa", "pk8": "PK 8", "pk10": "PK 10", "pk14": "PK 14",
  "ndogpassi": "Ndogpassi", "mboppi": "Mboppi", "nkongmondo": "Nkongmondo",
  "ange-raphael": "Ange Raphaël", "brazzaville": "Brazzaville",
  "mabanda": "Mabanda", "sodiko": "Sodiko", "yassa": "Yassa", "japoma": "Japoma"
}

export default function SignalerPage() {
  const [quartier, setQuartier] = useState("")
  const [niveauEau, setNiveauEau] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!quartier || !niveauEau) {
      setError("Veuillez sélectionner un quartier et un niveau d'eau.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Coordonnées GPS du quartier sélectionné
      const coords: Record<string, [number, number]> = {
        "makepe": [4.0731, 9.7478], "new-bell": [4.0489, 9.6921],
        "ndokotti": [4.0412, 9.7103], "bonamoussadi": [4.0891, 9.7234],
        "bonaberi": [4.0673, 9.6543], "deido": [4.0634, 9.7156],
        "akwa": [4.0511, 9.7039], "bonapriso": [4.0423, 9.6987],
        "logbessou": [4.1023, 9.7512], "ndog-bong": [4.0312, 9.6834],
        "bali": [4.0567, 9.6912], "kotto": [4.0934, 9.7634],
        "bassa": [4.0234, 9.7456], "pk8": [4.0823, 9.7823],
        "pk10": [4.0956, 9.7934], "pk14": [4.1134, 9.8123],
        "ndogpassi": [4.0156, 9.7634], "mboppi": [4.0589, 9.7234],
        "nkongmondo": [4.0467, 9.6834], "ange-raphael": [4.0378, 9.7012],
        "brazzaville": [4.0289, 9.6756], "mabanda": [4.0712, 9.6623],
        "sodiko": [4.0834, 9.6712], "yassa": [4.0067, 9.8012],
        "japoma": [3.9956, 9.8134]
      }

      const [lat, lng] = coords[quartier] || [4.0511, 9.7679]

      await signalementsAPI.creer({
        quartier_id: quartier,
        lat,
        lng,
        niveau_eau: niveauEau,
        description: description || null
      })

      setSuccess(true)
      setQuartier("")
      setNiveauEau("")
      setDescription("")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <Sidebar />
        <div className="pt-14 md:pl-56 pb-16 md:pb-0 flex items-center justify-center min-h-screen">
          <div className="text-center px-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--risk-faible-bg)" }}
            >
              <CheckCircle size={32} style={{ color: "var(--risk-faible)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Signalement enregistré
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Merci pour votre contribution. Votre signalement aide à protéger votre communauté.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: "var(--brand)" }}
            >
              Faire un autre signalement
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Signaler une inondation
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Votre signalement aide à protéger votre quartier
            </p>
          </div>

          {/* Formulaire */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Quartier */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <MapPin size={14} className="inline mr-1" style={{ color: "var(--brand)" }} />
                Votre quartier
              </label>
              <select
                value={quartier}
                onChange={e => setQuartier(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-primary)",
                  border: `1px solid ${quartier ? "var(--brand)" : "var(--border)"}`,
                  color: "var(--text-primary)"
                }}
              >
                <option value="">Sélectionner un quartier</option>
                {QUARTIERS.map(id => (
                  <option key={id} value={id}>{NOMS_QUARTIERS[id]}</option>
                ))}
              </select>
            </div>

            {/* Niveau eau */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Droplets size={14} className="inline mr-1" style={{ color: "var(--brand)" }} />
                Niveau d'eau estimé
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["cheville", "genou", "taille"].map(niveau => (
                  <button
                    key={niveau}
                    onClick={() => setNiveauEau(niveau)}
                    className="py-3 rounded-xl text-sm font-semibold capitalize transition-all"
                    style={{
                      background: niveauEau === niveau ? "var(--brand)" : "var(--bg-primary)",
                      color: niveauEau === niveau ? "white" : "var(--text-secondary)",
                      border: `1px solid ${niveauEau === niveau ? "var(--brand)" : "var(--border)"}`
                    }}
                  >
                    {niveau.charAt(0).toUpperCase() + niveau.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: La rue principale est inondée, l'eau monte rapidement..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            {/* Erreur */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: "var(--risk-eleve-bg)", border: "1px solid var(--risk-eleve)" }}
              >
                <AlertTriangle size={14} style={{ color: "var(--risk-eleve)" }} />
                <span className="text-sm" style={{ color: "var(--risk-eleve)" }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: loading ? "var(--text-muted)" : "var(--brand)",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Envoi en cours..." : "Soumettre le signalement"}
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            3 signalements confirmés dans un quartier déclenchent une alerte SMS automatique
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}