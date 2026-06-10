from fastapi import APIRouter, HTTPException
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import os

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@router.get("/")
async def get_tous_les_scores():
    try:
        quartiers = supabase.table("quartiers").select("*").execute()

        scores_result = []
        for q in quartiers.data:
            dernier = supabase.table("scores_risque")\
                .select("*")\
                .eq("quartier_id", q["id"])\
                .order("calculated_at", desc=True)\
                .limit(1)\
                .execute()

            if dernier.data:
                s = dernier.data[0]
                scores_result.append({
                    "quartier_id": q["id"],
                    "nom": q["nom"],
                    "nom_en": q["nom_en"],
                    "lat": q["lat"],
                    "lng": q["lng"],
                    "score": s["score"],
                    "niveau": s["niveau"],
                    "pluie_6h": s["pluie_6h"],
                    "pluie_24h": s["pluie_24h"],
                    "calculated_at": s["calculated_at"]
                })
            else:
                scores_result.append({
                    "quartier_id": q["id"],
                    "nom": q["nom"],
                    "nom_en": q["nom_en"],
                    "lat": q["lat"],
                    "lng": q["lng"],
                    "score": 0,
                    "niveau": "faible",
                    "pluie_6h": 0,
                    "pluie_24h": 0,
                    "calculated_at": None
                })

        return {"scores": scores_result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{quartier_id}")
async def get_score_quartier(quartier_id: str):
    try:
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

        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        deux_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()

        historique = supabase.table("scores_risque")\
            .select("score, niveau, calculated_at")\
            .eq("quartier_id", quartier_id)\
            .gte("calculated_at", vingt_quatre_heures_avant)\
            .order("calculated_at", desc=False)\
            .execute()

        signalements = supabase.table("signalements")\
            .select("id")\
            .eq("quartier_id", quartier_id)\
            .eq("valide", True)\
            .gte("created_at", deux_heures_avant)\
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
    try:
        from services.scoring import calculer_tous_les_scores
        await calculer_tous_les_scores()
        return {"message": "Calcul déclenché avec succès"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))