"use client"

import { useState, useEffect } from "react"
import { authAPI } from "@/lib/api"
import { AuthToken } from "@/types"

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<"citoyen" | "admin" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const savedToken = localStorage.getItem("vigil_token")
      const savedRole = localStorage.getItem("vigil_role") as "citoyen" | "admin" | null
      if (savedToken && savedRole) {
        setToken(savedToken)
        setRole(savedRole)
      }
    } catch {}
  }, [])

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data: AuthToken = await authAPI.adminLogin({ email, password })
      setToken(data.access_token)
      setRole("admin")
      try {
        localStorage.setItem("vigil_token", data.access_token)
        localStorage.setItem("vigil_role", "admin")
      } catch {}
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const registerCitoyen = async (telephone: string, nom?: string, quartier_id?: string) => {
    setLoading(true)
    setError(null)
    try {
      await authAPI.citoyenRegister({ telephone, nom, quartier_id })
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginCitoyen = async (telephone: string) => {
    setLoading(true)
    setError(null)
    try {
      await authAPI.citoyenLogin({ telephone })
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyCitoyen = async (telephone: string, otp: string) => {
    setLoading(true)
    setError(null)
    try {
      const data: AuthToken = await authAPI.citoyenVerify({ telephone, otp })
      setToken(data.access_token)
      setRole("citoyen")
      try {
        localStorage.setItem("vigil_token", data.access_token)
        localStorage.setItem("vigil_role", "citoyen")
      } catch {}
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    try {
      localStorage.removeItem("vigil_token")
      localStorage.removeItem("vigil_role")
    } catch {}
  }

  return {
    token,
    role,
    loading,
    error,
    mounted,
    isAuthenticated: !!token,
    loginAdmin,
    loginCitoyen,
    registerCitoyen,
    verifyCitoyen,
    logout
  }
}