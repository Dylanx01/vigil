const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ─── Helper ────────────────────────────────────────────

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Erreur serveur")
  }

  return response.json()
}

// ─── Scores ────────────────────────────────────────────

export const scoresAPI = {
  getTous: () => fetchAPI<{ scores: any[] }>("/api/scores/"),
  getQuartier: (id: string) => fetchAPI<any>(`/api/scores/${id}`),
  calculer: () => fetchAPI<any>("/api/scores/calculer", { method: "POST" }),
}

// ─── Signalements ──────────────────────────────────────

export const signalementsAPI = {
  getTous: () => fetchAPI<{ signalements: any[] }>("/api/signalements/"),
  getQuartier: (id: string) => fetchAPI<any>(`/api/signalements/${id}`),
  creer: (data: any) => fetchAPI<any>("/api/signalements/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
}

// ─── Abonnements ───────────────────────────────────────

export const abonnementsAPI = {
  creer: (data: any) => fetchAPI<any>("/api/abonnements/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  supprimer: (data: any) => fetchAPI<any>("/api/abonnements/", {
    method: "DELETE",
    body: JSON.stringify(data),
  }),
  countQuartier: (id: string) => fetchAPI<any>(`/api/abonnements/${id}/count`),
}

// ─── Auth ──────────────────────────────────────────────

export const authAPI = {
  citoyenRegister: (data: any) => fetchAPI<any>("/api/auth/citoyen/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  citoyenVerify: (data: any) => fetchAPI<any>("/api/auth/citoyen/verify", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  citoyenLogin: (data: any) => fetchAPI<any>("/api/auth/citoyen/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  adminLogin: (data: any) => fetchAPI<any>("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),
}

// ─── Admin ─────────────────────────────────────────────

export const adminAPI = {
  getStats: (token: string) => fetchAPI<any>("/api/admin/stats", {}, token),
  getHeatmap: (token: string) => fetchAPI<any>("/api/admin/heatmap", {}, token),
  getSignalements: (token: string) => fetchAPI<any>("/api/admin/signalements", {}, token),
  getAbonnes: (token: string) => fetchAPI<any>("/api/admin/abonnes", {}, token),
  getEvolution: (token: string) => fetchAPI<any>("/api/admin/evolution", {}, token),
  getHistoriqueAlertes: (token: string) => fetchAPI<any>("/api/admin/alertes/historique", {}, token),
  declencherAlerte: (data: any, token: string) => fetchAPI<any>("/api/admin/alerte", {
    method: "POST",
    body: JSON.stringify(data),
  }, token),
  exportSignalements: (token: string) => `${API_URL}/api/admin/export/signalements`,
  exportScores: (token: string) => `${API_URL}/api/admin/export/scores`,
}

// ─── Villes ────────────────────────────────────────────

export const villesAPI = {
  getTous: () => fetchAPI<{ villes: any[] }>("/api/villes/"),
  getQuartiers: (id: string) => fetchAPI<any>(`/api/villes/${id}/quartiers`),
}

// ─── Feedbacks ─────────────────────────────────────────

export const feedbacksAPI = {
  soumettre: (data: any, token: string) => fetchAPI<any>("/api/feedbacks/", {
    method: "POST",
    body: JSON.stringify(data),
  }, token),
  getQuartier: (id: string) => fetchAPI<any>(`/api/feedbacks/${id}`),
}