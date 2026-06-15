"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { abonnementsAPI } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Bell, BellOff, LogOut, User, MapPin, Shield } from "lucide-react"
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
    } catch (err: any) {
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

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />

      <div className="pt-14 md:pl-56 pb-16 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header profil */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "#EFF6FF", boxShadow: "0 4px 12px rgba(14,165,233,0.15)" }}
                >
                  <User size={24} style={{ color: "#0EA5E9" }} />
                </div>
                <div>
                  <p
                    className="font-bold text-base mb-0.5"
                    style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Citoyen Vigil
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {telephone}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
              >
                <LogOut size={12} />
                Déconnexion
              </button>
            </div>

            {/* Badge abonnements actifs */}
            {abonnements.length > 0 && (
              <div
                className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "#EFF6FF" }}
              >
                <Bell size={13} style={{ color: "#0EA5E9" }} />
                <span className="text-xs font-medium" style={{ color: "#0369A1" }}>
                  Vous êtes alerté sur{" "}
                  <strong>{abonnements.length} quartier{abonnements.length > 1 ? "s" : ""}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Abonnements SMS */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #F0F4FF" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#EFF6FF" }}
              >
                <Bell size={15} style={{ color: "#0EA5E9" }} />
              </div>
              <div className="flex-1">
                <h2
                  className="font-bold text-sm"
                  style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Alertes SMS
                </h2>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  Activez les quartiers à surveiller
                </p>
              </div>
              {abonnements.length > 0 && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
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
                    onClick={() => toggleAbonnement(q.id, q.nom)}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: actif ? "#EFF6FF" : "#F8FAFC",
                      border: `1.5px solid ${actif ? "#0EA5E9" : "transparent"}`,
                      boxShadow: actif ? "0 0 0 1px rgba(14,165,233,0.1)" : "none"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={14} style={{ color: actif ? "#0EA5E9" : "#94A3B8" }} />
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
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: actif ? "#0EA5E9" : "#E2E8F0",
                        boxShadow: actif ? "0 2px 8px rgba(14,165,233,0.3)" : "none"
                      }}
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

          <p className="text-xs text-center mt-4" style={{ color: "#94A3B8" }}>
            SMS envoyés uniquement en cas de risque élevé ou critique
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}