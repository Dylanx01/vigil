"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function MairieLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { loginAdmin, loading, error } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return
    try {
      await loginAdmin(email, password)
      router.push("/mairie/dashboard")
    } catch {}
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
        <img src="/logo.svg" alt="Vigil" width={56} height={56} className="mx-auto" />
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Vigil
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Portail Mairie — Accès restreint
          </p>
        </div>

        {/* Card login */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Connexion administrateur
          </h2>

          <div className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vigil.cm"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-primary)",
                  border: `1px solid ${email ? "var(--brand)" : "var(--border)"}`,
                  color: "var(--text-primary)"
                }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-12"
                  style={{
                    background: "var(--bg-primary)",
                    border: `1px solid ${password ? "var(--brand)" : "var(--border)"}`,
                    color: "var(--text-primary)"
                  }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "var(--risk-eleve-bg)",
                  color: "var(--risk-eleve)",
                  border: "1px solid var(--risk-eleve)"
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all mt-2"
              style={{
                background: loading || !email || !password ? "var(--text-muted)" : "var(--brand)",
                cursor: loading || !email || !password ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Accès réservé aux agents autorisés
        </p>
      </div>
    </div>
  )
}