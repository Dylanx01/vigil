from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
import re

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class AbonnementSchema(BaseModel):
    telephone: str
    quartier_id: str

def valider_telephone(telephone: str) -> bool:
    """
    Valide un numéro de téléphone camerounais.
    Formats acceptés : 6XXXXXXXX ou +2376XXXXXXXX
    """
    telephone = telephone.replace(" ", "").replace("-", "")
    pattern = r"^(\+237)?6[5-9]\d{7}$"
    return bool(re.match(pattern, telephone))

def normaliser_telephone(telephone: str) -> str:
    """
    Normalise le numéro en format international +237XXXXXXXXX
    """
    telephone = telephone.replace(" ", "").replace("-", "")
    if telephone.startswith("+237"):
        return telephone
    if telephone.startswith("237"):
        return f"+{telephone}"
    return f"+237{telephone}"

@router.post("/")
async def creer_abonnement(data: AbonnementSchema):
    """
    Inscrit un numéro de téléphone pour recevoir
    les alertes SMS d'un quartier.
    """
    try:
        # Validation numéro
        if not valider_telephone(data.telephone):
            raise HTTPException(
                status_code=400,
                detail="Numéro de téléphone invalide. Format attendu : 6XXXXXXXX"
            )
        
        telephone_normalise = normaliser_telephone(data.telephone)
        
        # Vérification abonnement existant
        existant = supabase.table("abonnements")\
            .select("id, actif")\
            .eq("telephone", telephone_normalise)\
            .eq("quartier_id", data.quartier_id)\
            .execute()
        
        if existant.data:
            abonnement = existant.data[0]
            
            # Si abonnement inactif → réactiver
            if not abonnement["actif"]:
                supabase.table("abonnements")\
                    .update({"actif": True})\
                    .eq("id", abonnement["id"])\
                    .execute()
                return {"message": "Abonnement réactivé avec succès"}
            
            # Si déjà actif
            return {"message": "Vous êtes déjà abonné à ce quartier"}
        
        # Nouvel abonnement
        supabase.table("abonnements").insert({
            "telephone": telephone_normalise,
            "quartier_id": data.quartier_id,
            "actif": True
        }).execute()
        
        return {
            "message": "Abonnement créé avec succès",
            "telephone": telephone_normalise,
            "quartier_id": data.quartier_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/")
async def supprimer_abonnement(data: AbonnementSchema):
    """
    Désactive un abonnement SMS.
    Le numéro ne recevra plus d'alertes pour ce quartier.
    """
    try:
        telephone_normalise = normaliser_telephone(data.telephone)
        
        existant = supabase.table("abonnements")\
            .select("id")\
            .eq("telephone", telephone_normalise)\
            .eq("quartier_id", data.quartier_id)\
            .eq("actif", True)\
            .execute()
        
        if not existant.data:
            raise HTTPException(
                status_code=404,
                detail="Abonnement introuvable"
            )
        
        supabase.table("abonnements")\
            .update({"actif": False})\
            .eq("id", existant.data[0]["id"])\
            .execute()
        
        return {"message": "Abonnement supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quartier_id}/count")
async def count_abonnes(quartier_id: str):
    """
    Retourne le nombre d'abonnés actifs d'un quartier.
    Affiché sur le dashboard.
    """
    try:
        response = supabase.table("abonnements")\
            .select("id")\
            .eq("quartier_id", quartier_id)\
            .eq("actif", True)\
            .execute()
        
        return {
            "quartier_id": quartier_id,
            "abonnes": len(response.data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))