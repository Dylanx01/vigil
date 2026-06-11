export type NiveauRisque = "faible" | "modere" | "eleve" | "critique"

export interface Quartier {
  id: string
  nom: string
  nom_en: string
  lat: number
  lng: number
  vulnerabilite: number
  ville_id: string
}

export interface ScoreRisque {
  quartier_id: string
  nom: string
  nom_en: string
  lat: number
  lng: number
  score: number
  niveau: NiveauRisque
  pluie_6h: number
  pluie_24h: number
  calculated_at: string | null
}

export interface Signalement {
  id: string
  quartier_id: string
  lat: number
  lng: number
  niveau_eau: "cheville" | "genou" | "taille"
  description: string | null
  valide: boolean
  created_at: string
}

export interface Abonnement {
  telephone: string
  quartier_id: string
}

export interface Feedback {
  quartier_id: string
  alerte_confirmee: boolean
  commentaire?: string
}

export interface AdminStats {
  total_abonnes: number
  total_citoyens_inscrits: number
  signalements_24h: number
  signalements_actifs: number
  sms_envoyes_24h: number
  quartiers_en_alerte: number
  quartiers_alerte_detail: ScoreRisque[]
  feedbacks_24h: number
}

export interface Ville {
  id: string
  nom: string
  pays: string
  lat: number
  lng: number
  actif: boolean
}

export interface AuthToken {
  access_token: string
  token_type: string
  role: "citoyen" | "admin"
  institution?: string
}