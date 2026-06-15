"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Shield, Phone, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ConnexionPage() {
  const [step, setStep] = useState<"telephone" | "otp">("telephone")
  const [telephone, setTelephone] = useState("")
  const [otp, setOtp] = useState("")
  const { loginCitoyen, verifyCitoyen, loading, error } = useAuth()
  const router = useRouter()

  const handleSendOTP = async () => {
    if (!telephone) return
    try {
      await loginCitoyen(telephone)
      setStep("otp")
    } catch {}
  }

  const handleVerify = async () => {
    if (!otp) return
    try {
      await verifyCitoyen(telephone, otp)
      router.push("/")
    } catch {}
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#F0F4FF" }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
      <img src="/logo.svg" alt="Vigil" width={56} height={56} className="mx-auto" />
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Vigil
        </h1>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Connexion à votre compte
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
        }}
      >
        {step === "telephone" ? (
          <>
            <h2
              className="text-lg font-bold mb-1"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Votre numéro
            </h2>
            <p className="text-sm mb-6" style={{ color: "#64748B" }}>
              Nous vous enverrons un code de connexion par SMS
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#64748B" }}>
                  Numéro Orange Cameroun
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone size={14} color="#0EA5E9" />
                    <span className="text-sm font-medium" style={{ color: "#64748B" }}>+237</span>
                    <div className="w-px h-4" style={{ background: "#E2E8F0" }} />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value.replace(/\D/g, ""))}
                    placeholder="6XXXXXXXX"
                    className="w-full rounded-xl pl-24 pr-4 py-3.5 text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: `1.5px solid ${telephone ? "#0EA5E9" : "#E2E8F0"}`,
                      color: "#0F172A",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.05em"
                    }}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !telephone}
                className="w-full py-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all mt-2"
                style={{
                  background: loading || !telephone ? "#CBD5E1" : "#0EA5E9",
                  cursor: loading || !telephone ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Envoi..." : "Recevoir le code SMS"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("telephone")}
              className="flex items-center gap-1.5 text-xs font-medium mb-5"
              style={{ color: "#64748B" }}
            >
              <ArrowLeft size={13} />
              Modifier le numéro
            </button>

            <h2
              className="text-lg font-bold mb-1"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Code de connexion
            </h2>
            <p className="text-sm mb-1" style={{ color: "#64748B" }}>
              Code envoyé au
            </p>
            <p
              className="text-sm font-bold mb-6"
              style={{ color: "#0F172A", fontFamily: "'JetBrains Mono', monospace" }}
            >
              +237 {telephone}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#64748B" }}>
                  Code à 6 chiffres
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl px-4 py-4 text-center text-2xl outline-none transition-all tracking-widest"
                  style={{
                    background: "#F8FAFC",
                    border: `1.5px solid ${otp.length === 6 ? "#0EA5E9" : "#E2E8F0"}`,
                    color: "#0F172A",
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading || otp.length !== 6 ? "#CBD5E1" : "#0EA5E9",
                  cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Vérification..." : "Se connecter"}
                {!loading && <ArrowRight size={16} />}
              </button>

              <button
                onClick={handleSendOTP}
                className="text-xs text-center"
                style={{ color: "#64748B" }}
              >
                Renvoyer le code
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lien inscription */}
      <p className="text-sm mt-6" style={{ color: "#64748B" }}>
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-semibold"
          style={{ color: "#0EA5E9" }}
        >
          S'inscrire
        </Link>
      </p>

      {/* Lien mairie */}
      <p className="text-xs mt-3" style={{ color: "#94A3B8" }}>
        Agent municipal ?{" "}
        <Link
          href="/mairie/login"
          style={{ color: "#94A3B8", textDecoration: "underline" }}
        >
          Portail Mairie
        </Link>
      </p>
    </div>
  )
}