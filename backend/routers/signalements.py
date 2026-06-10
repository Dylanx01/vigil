from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from typing import Optional
import hashlib
import os

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class SignalementSchema(BaseModel):
    quartier_id: str
    lat: float
    lng: float
    niveau_eau: str  # cheville | genou | taille
    description: Optional[str] = None

@router.get("/")
async def get_signalements():
    """
    Retourne tous les signalements actifs des 2 dernières heures.
    Affiché sur le feed temps réel du frontend.
    """
    try:
        response = supabase.table("signalements")\
            .select("*")\
            .gte("created_at", "now() - interval '2 hours'")\
            .order("created_at", desc=True)\
            .execute()
        
        return {"signalements": response.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_signalement(data: SignalementSchema, request: Request):
    """
    Crée un nouveau signalement citoyen.
    Inclut anti-spam par IP hashée.
    """
    try:
        # Anti-spam — hash IP
        ip = request.client.host
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()
        
        # Max 3 signalements par IP par heure par quartier
        existing = supabase.table("signalements")\
            .select("id")\
            .eq("quartier_id", data.quartier_id)\
            .eq("ip_hash", ip_hash)\
            .gte("created_at", "now() - interval '1 hour'")\
            .execute()
        
        if len(existing.data) >= 3:
            raise HTTPException(
                status_code=429,
                detail="Trop de signalements. Réessayez dans 1 heure."
            )
        
        # Validation niveau_eau
        niveaux_valides = ["cheville", "genou", "taille"]
        if data.niveau_eau not in niveaux_valides:
            raise HTTPException(
                status_code=400,
                detail=f"Niveau eau invalide. Valeurs acceptées : {niveaux_valides}"
            )
        
        # Comptage signalements existants pour ce quartier
        # Si >= 3 signalements dans la dernière heure → validation automatique
        count_quartier = supabase.table("signalements")\
            .select("id")\
            .eq("quartier_id", data.quartier_id)\
            .gte("created_at", "now() - interval '1 hour'")\
            .execute()
        
        valide = len(count_quartier.data) >= 2  # +1 avec le nouveau = 3

        # Insertion
        nouveau = supabase.table("signalements").insert({
            "quartier_id": data.quartier_id,
            "lat": data.lat,
            "lng": data.lng,
            "niveau_eau": data.niveau_eau,
            "description": data.description,
            "ip_hash": ip_hash,
            "valide": valide
        }).execute()
        
        return {
            "message": "Signalement enregistré",
            "valide": valide,
            "data": nouveau.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quartier_id}")
async def get_signalements_quartier(quartier_id: str):
    """
    Retourne les signalements actifs d'un quartier spécifique.
    """
    try:
        response = supabase.table("signalements")\
            .select("*")\
            .eq("quartier_id", quartier_id)\
            .gte("created_at", "now() - interval '2 hours'")\
            .order("created_at", desc=True)\
            .execute()
        
        return {
            "quartier_id": quartier_id,
            "signalements": response.data,
            "total": len(response.data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))