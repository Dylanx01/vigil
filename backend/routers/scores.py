from fastapi import APIRouter, HTTPException
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@router.get("/")
async def get_tous_les_scores():
    """
    Retourne le dernier score de risque pour chaque quartier.
    C'est cet endpoint que la carte frontend appelle.
    """
    try:
        # Pour chaque quartier on veut uniquement le score le plus récent
        response = supabase.rpc("get_derniers_scores").execute()
        return {"scores": response.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quartier_id}")
async def get_score_quartier(quartier_id: str):
    """
    Retourne le dernier score d'un quartier spécifique
    avec son historique des 24 dernières heures.
    """
    try:
        # Dernier score
        dernier = supabase.table("scores_risque")\
            .select("*")\
            .eq("quartier_id", quartier_id)\
            .order("calculated_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not dernier.data:
            raise HTTPException(
                status_code=404,
                detail=f"Quartier '{quartier_id}' introuvable"
            )
        
        # Historique 24h
        historique = supabase.table("scores_risque")\
            .select("score, niveau, calculated_at")\
            .eq("quartier_id", quartier_id)\
            .gte("calculated_at", "now() - interval '24 hours'")\
            .order("calculated_at", desc=False)\
            .execute()
        
        # Nombre de signalements actifs
        signalements = supabase.table("signalements")\
            .select("id")\
            .eq("quartier_id", quartier_id)\
            .eq("valide", True)\
            .gte("created_at", "now() - interval '2 hours'")\
            .execute()
        
        return {
            "quartier_id": quartier_id,
            "score_actuel": dernier.data[0],
            "historique_24h": historique.data,
            "signalements_actifs": len(signalements.data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculer")
async def forcer_calcul():
    """
    Force un recalcul immédiat des scores.
    Utile pour les tests et la démo.
    """
    try:
        from services.scoring import calculer_tous_les_scores
        await calculer_tous_les_scores()
        return {"message": "Calcul déclenché avec succès"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))