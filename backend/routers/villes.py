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
async def get_villes():
    """
    Retourne toutes les villes actives.
    Utilisé par le frontend pour le sélecteur de ville.
    """
    try:
        response = supabase.table("villes")\
            .select("*")\
            .eq("actif", True)\
            .execute()

        return {"villes": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ville_id}")
async def get_ville(ville_id: str):
    """
    Retourne les détails d'une ville.
    """
    try:
        response = supabase.table("villes")\
            .select("*")\
            .eq("id", ville_id)\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Ville introuvable")

        return {"ville": response.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ville_id}/quartiers")
async def get_quartiers_ville(ville_id: str):
    """
    Retourne tous les quartiers d'une ville.
    """
    try:
        ville = supabase.table("villes")\
            .select("id")\
            .eq("id", ville_id)\
            .execute()

        if not ville.data:
            raise HTTPException(status_code=404, detail="Ville introuvable")

        quartiers = supabase.table("quartiers")\
            .select("*")\
            .eq("ville_id", ville_id)\
            .execute()

        return {
            "ville_id": ville_id,
            "quartiers": quartiers.data,
            "total": len(quartiers.data)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))