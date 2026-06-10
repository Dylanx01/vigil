from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from middleware.auth import require_citoyen
from typing import Optional
import os

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class FeedbackSchema(BaseModel):
    quartier_id: str
    alerte_confirmee: bool
    commentaire: Optional[str] = None

@router.post("/")
async def soumettre_feedback(data: FeedbackSchema, citoyen=Depends(require_citoyen)):
    """
    Un citoyen confirme ou infirme une alerte après coup.
    Améliore l'algorithme sur le long terme.
    """
    try:
        # Un seul feedback par citoyen par quartier par heure
        une_heure_avant = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

        existant = supabase.table("feedbacks")\
            .select("id")\
            .eq("citoyen_id", citoyen["id"])\
            .eq("quartier_id", data.quartier_id)\
            .gte("created_at", une_heure_avant)\
            .execute()

        if existant.data:
            raise HTTPException(
                status_code=429,
                detail="Vous avez déjà soumis un feedback pour ce quartier récemment."
            )

        result = supabase.table("feedbacks").insert({
            "citoyen_id": citoyen["id"],
            "quartier_id": data.quartier_id,
            "alerte_confirmee": data.alerte_confirmee,
            "commentaire": data.commentaire
        }).execute()

        return {
            "message": "Feedback enregistré. Merci pour votre contribution.",
            "data": result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quartier_id}")
async def get_feedbacks_quartier(quartier_id: str):
    """
    Retourne les feedbacks d'un quartier — public.
    Permet de voir le taux de confirmation des alertes.
    """
    try:
        sept_jours_avant = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

        response = supabase.table("feedbacks")\
            .select("alerte_confirmee, commentaire, created_at")\
            .eq("quartier_id", quartier_id)\
            .gte("created_at", sept_jours_avant)\
            .order("created_at", desc=True)\
            .execute()

        total = len(response.data)
        confirmees = sum(1 for f in response.data if f["alerte_confirmee"])
        taux = round(confirmees / total * 100, 1) if total > 0 else 0

        return {
            "quartier_id": quartier_id,
            "total_feedbacks": total,
            "alertes_confirmees": confirmees,
            "taux_confirmation": taux,
            "feedbacks": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))