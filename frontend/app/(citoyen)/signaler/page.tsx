"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { signalementsAPI } from "@/lib/api"
import { MapPin, Droplets, CheckCircle, AlertTriangle, Send } from "lucide-react"
import toast from "react-hot-toast"

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

const COORDS: Record<string, [number, number]> = {
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

const NIVEAUX = [
  { id: "cheville", label: "Cheville", desc: "< 30 cm", color: "#F59E0B", bg: "#FFFBEB" },
  { id: "genou", label: "Genou", desc: "30–60 cm", color: "#EF4444", bg: "#FEF2F2" },
  { id: "taille", label: "Taille", desc: "> 60 cm", color: "#7C3AED", bg: "#F5F3FF" },
]

export default function SignalerPage() {
  const [quartier, setQuartier] = useState("")
  const [niveauEau, setNiveauEau] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!quartier || !niveauEau) {
      toast.error("Veuillez sélectionner un quartier et un niveau d'eau.")
      return
    }

    setLoading(true)

    try {
      const [lat, lng] = COORDS[quartier] || [4.0511, 9.7679]
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
      toast.error(err.message || "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
        <Navbar />
        <Sidebar />
        <div className="pt-14 md:pl-56 pb-16 md:pb-0 flex items-center justify-center min-h-screen">
          <div className="text-center px-6 max-w-sm">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "#ECFDF5", boxShadow: "0 8px 32px rgba(16,185,129,0.15)" }}
            >
              <CheckCircle size={36} style={{ color: "#10B981" }} />
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Signalement enregistré
            </h2>
            <p className="text-sm mb-2" style={{ color: "#64748B" }}>
              Merci pour votre contribution.
            </p>
            <p className="text-sm mb-8" style={{ color: "#64748B" }}>
              Votre signalement aide à protéger votre communauté et peut déclencher une alerte SMS automatique.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-8 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all"
              style={{ background: "#0EA5E9", boxShadow: "0 4px 16px rgba(14,165,233,0.3)" }}
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
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-6 pt-2">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Signaler une inondation
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Votre signalement aide à protéger votre quartier
            </p>
          </div>

          {/* Formulaire */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-6"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
          >
            {/* Quartier */}
            <div>
              <label
                className="flex items-center gap-1.5 text-sm font-semibold mb-2.5"
                style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MapPin size={14} style={{ color: "#0EA5E9" }} />
                Votre quartier
              </label>
              <select
                value={quartier}
                onChange={e => setQuartier(e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{
                  background: "#F8FAFC",
                  border: `1.5px solid ${quartier ? "#0EA5E9" : "#E2E8F0"}`,
                  color: quartier ? "#0F172A" : "#94A3B8",
                  boxShadow: quartier ? "0 0 0 3px rgba(14,165,233,0.1)" : "none"
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
              <label
                className="flex items-center gap-1.5 text-sm font-semibold mb-2.5"
                style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Droplets size={14} style={{ color: "#0EA5E9" }} />
                Niveau d'eau estimé
              </label>
              <div className="grid grid-cols-3 gap-3">
                {NIVEAUX.map(({ id, label, desc, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => setNiveauEau(id)}
                    className="py-3.5 rounded-xl text-sm font-semibold transition-all flex flex-col items-center gap-0.5"
                    style={{
                      background: niveauEau === id ? bg : "#F8FAFC",
                      color: niveauEau === id ? color : "#64748B",
                      border: `1.5px solid ${niveauEau === id ? color : "#E2E8F0"}`,
                      boxShadow: niveauEau === id ? `0 0 0 3px ${color}20` : "none"
                    }}
                  >
                    <span>{label}</span>
                    <span className="text-xs font-normal opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                className="flex items-center gap-1.5 text-sm font-semibold mb-2.5"
                style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Description
                <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "12px" }}>— optionnel</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: La rue principale est inondée, l'eau monte rapidement..."
                rows={3}
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none resize-none transition-all"
                style={{
                  background: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                  color: "#0F172A"
                }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? "#94A3B8" : "#0EA5E9",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(14,165,233,0.3)"
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Soumettre le signalement
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div
            className="flex items-start gap-2 mt-4 px-4 py-3 rounded-xl"
            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
          >
            <AlertTriangle size={13} style={{ color: "#0EA5E9", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "#0369A1" }}>
              3 signalements confirmés dans un même quartier déclenchent automatiquement une alerte SMS aux abonnés.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}