"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { abonnementsAPI } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Bell, BellOff, LogOut, User, MapPin } from "lucide-react"

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

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated || role !== "citoyen") {
      router.push("/connexion")
      return
    }
    // Récupérer le numéro depuis le token
    try {
      const payload = JSON.parse(atob(token!.split(".")[1]))
      setTelephone(payload.sub || "")
    } catch {}
  }, [mounted, isAuthenticated, role])

  const toggleAbonnement = async (quartier_id: string) => {
    if (!telephone) return
    setLoading(true)
    try {
      if (abonnements.includes(quartier_id)) {
        await abonnementsAPI.supprimer({ telephone, quartier_id })
        setAbonnements(prev => prev.filter(q => q !== quartier_id))
      } else {
        await abonnementsAPI.creer({ telephone, quartier_id })
        setAbonnements(prev => [...prev, quartier_id])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!mounted) return null

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header profil */}
          <div
            className="rounded-2xl p-5 mb-6 flex items-center justify-between"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "#EFF6FF" }}
              >
                <User size={22} style={{ color: "#0EA5E9" }} />
              </div>
              <div>
                <p
                  className="font-bold text-base"
                  style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Citoyen Vigil
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  +237 {telephone}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: "#FEF2F2", color: "#EF4444" }}
            >
              <LogOut size={12} />
              Déconnexion
            </button>
          </div>

          {/* Abonnements SMS */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #F0F4FF" }}
            >
              <Bell size={16} style={{ color: "#0EA5E9" }} />
              <div>
                <h2
                  className="font-bold text-sm"
                  style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Alertes SMS
                </h2>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  Sélectionnez les quartiers à surveiller
                </p>
              </div>
              {abonnements.length > 0 && (
                <span
                  className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#EFF6FF", color: "#0EA5E9" }}
                >
                  {abonnements.length} actif{abonnements.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              {QUARTIERS.map(q => {
                const actif = abonnements.includes(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => toggleAbonnement(q.id)}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: actif ? "#EFF6FF" : "#F8FAFC",
                      border: `1.5px solid ${actif ? "#0EA5E9" : "transparent"}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={14}
                        style={{ color: actif ? "#0EA5E9" : "#94A3B8" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: actif ? "#0F172A" : "#64748B",
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                      >
                        {q.nom}
                      </span>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: actif ? "#0EA5E9" : "#E2E8F0" }}
                    >
                      {actif
                        ? <Bell size={12} color="white" />
                        : <BellOff size={12} color="#94A3B8" />
                      }
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-center mt-4" style={{ color: "#94A3B8" }}>
            Vous recevrez des SMS uniquement en cas de risque élevé ou critique
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}