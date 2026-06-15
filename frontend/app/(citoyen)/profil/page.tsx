"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { abonnementsAPI } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Card } from "@/components/ui/Card"
import { Toggle } from "@/components/ui/Toggle"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { Bell, LogOut, Shield, MapPin, Search } from "lucide-react"
import toast from "react-hot-toast"

const QUARTIERS = [
  { id: "makepe", nom: "Makepe" },
  { id: "new-bell", nom: "New Bell" },
  { id: "ndokotti", nom: "Ndokotti" },
  { id: "bonamoussadi", nom: "Bonamoussadi" },
  { id: "bonaberi", nom: "Bonabéri" },
  { id: "deido", nom: "Deido" },
  { id: "akwa", nom: "Akwa" },
  { id: "bonapriso", nom: "Bonapriso" },
  { id: "logbessou", nom: "Logbessou" },
  { id: "ndog-bong", nom: "Ndog-Bong" },
  { id: "bali", nom: "Bali" },
  { id: "kotto", nom: "Kotto" },
  { id: "bassa", nom: "Bassa" },
  { id: "pk8", nom: "PK 8" },
  { id: "pk10", nom: "PK 10" },
  { id: "pk14", nom: "PK 14" },
  { id: "ndogpassi", nom: "Ndogpassi" },
  { id: "mboppi", nom: "Mboppi" },
  { id: "nkongmondo", nom: "Nkongmondo" },
  { id: "ange-raphael", nom: "Ange Raphaël" },
  { id: "brazzaville", nom: "Brazzaville" },
  { id: "mabanda", nom: "Mabanda" },
  { id: "sodiko", nom: "Sodiko" },
  { id: "yassa", nom: "Yassa" },
  { id: "japoma", nom: "Japoma" },
]

export default function ProfilPage() {
  const { token, role, logout, mounted, isAuthenticated } = useAuth()
  const router = useRouter()
  const [abonnements, setAbonnements] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [telephone, setTelephone] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated || role !== "citoyen") {
      router.push("/connexion")
      return
    }
    try {
      const payload = JSON.parse(atob(token!.split(".")[1]))
      setTelephone(payload.sub || "")
    } catch {}
  }, [mounted, isAuthenticated, role])

  const toggleAbonnement = async (quartier_id: string, nom: string) => {
    if (!telephone) return
    setLoading(true)
    try {
      if (abonnements.includes(quartier_id)) {
        await abonnementsAPI.supprimer({ telephone, quartier_id })
        setAbonnements(prev => prev.filter(q => q !== quartier_id))
        toast(`Alerte désactivée — ${nom}`, { icon: "🔕" })
      } else {
        await abonnementsAPI.creer({ telephone, quartier_id })
        setAbonnements(prev => [...prev, quartier_id])
        toast.success(`Alerte activée — ${nom}`)
      }
    } catch {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!mounted) return null

  const filteredQuartiers = QUARTIERS.filter(q =>
    q.nom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header profil */}
          <Card className="p-5 mb-4 rounded-squircle-lg animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-squircle-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--brand)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}
                >
                  <Shield size={24} color="white" />
                </div>
                <div>
                  <p className="font-bold text-base mb-0.5 font-heading" style={{ color: "#0F172A" }}>
                    Citoyen Vigil
                  </p>
                  <p className="text-sm font-mono" style={{ color: "#64748B" }}>
                    {telephone}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-squircle text-xs font-semibold flex-shrink-0"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>

            {/* Badge abonnements actifs */}
            {abonnements.length > 0 && (
              <div
                className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-squircle"
                style={{ background: "#EFF6FF" }}
              >
                <Bell size={13} style={{ color: "#0EA5E9" }} className="animate-breathe" />
                <span className="text-xs font-medium" style={{ color: "#0369A1" }}>
                  Vous êtes alerté sur{" "}
                  <AnimatedNumber value={abonnements.length} className="font-bold font-mono" style={{ color: "#0369A1" }} />
                  {" "}quartier{abonnements.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </Card>

          {/* Abonnements SMS */}
          <Card className="overflow-hidden animate-fadeInUp" style={{ animationDelay: "60ms" }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #F0F4FF" }}>
              <div className="w-8 h-8 rounded-squircle flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <Bell size={15} style={{ color: "#0EA5E9" }} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-sm font-heading" style={{ color: "#0F172A" }}>
                  Alertes SMS
                </h2>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  Activez les quartiers à surveiller
                </p>
              </div>
              {abonnements.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full font-mono" style={{ background: "#EFF6FF", color: "#0EA5E9" }}>
                  {abonnements.length} actif{abonnements.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Recherche */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-squircle" style={{ background: "#F0F4FF" }}>
                <Search size={14} color="#94A3B8" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un quartier..."
                  className="flex-1 text-sm outline-none bg-transparent font-heading"
                  style={{ color: "#0F172A" }}
                />
              </div>
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              {filteredQuartiers.map((q, i) => {
                const actif = abonnements.includes(q.id)
                return (
                  <Card
                    key={q.id}
                    interactive
                    onClick={() => !loading && toggleAbonnement(q.id, q.nom)}
                    className="p-3.5 flex items-center justify-between animate-fadeInUp"
                    style={{
                      animationDelay: `${Math.min(i * 15, 300)}ms`,
                      ...(actif
                        ? { background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.35)" }
                        : {})
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-squircle flex items-center justify-center flex-shrink-0"
                        style={{ background: actif ? "var(--brand)" : "#F0F4FF" }}
                      >
                        <MapPin size={13} color={actif ? "white" : "#94A3B8"} />
                      </div>
                      <span className="text-sm font-medium font-heading" style={{ color: actif ? "#0F172A" : "#64748B" }}>
                        {q.nom}
                      </span>
                    </div>
                    <Toggle active={actif} onChange={() => toggleAbonnement(q.id, q.nom)} disabled={loading} />
                  </Card>
                )
              })}
              {filteredQuartiers.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: "#94A3B8" }}>
                  Aucun quartier ne correspond à "{searchQuery}"
                </p>
              )}
            </div>
          </Card>

          <p className="text-xs text-center mt-4" style={{ color: "#94A3B8" }}>
            SMS envoyés uniquement en cas de risque élevé ou critique
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}