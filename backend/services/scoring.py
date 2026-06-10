import json
import os
import logging
from services.meteo import get_precipitation_data
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def charger_quartiers() -> list:
    """Charge les quartiers depuis le fichier JSON."""
    chemin = os.path.join(os.path.dirname(__file__), "../data/quartiers.json")
    with open(chemin, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["quartiers"]

def determiner_niveau(score: float) -> str:
    """Convertit un score numérique en niveau textuel."""
    if score < 25:
        return "faible"
    elif score < 50:
        return "modere"
    elif score < 75:
        return "eleve"
    else:
        return "critique"

def calculer_score(
    pluie_6h: float,
    pluie_24h: float,
    vulnerabilite: float,
    signalements_actifs: int
) -> float:
    """
    Algorithme de calcul du score de risque.
    Score entre 0 et 100.
    """
    # Normalisation des précipitations sur 100
    # Référence : 80mm/6h = inondation sévère à Douala
    pluie_6h_norm = min(pluie_6h / 80 * 100, 100)
    pluie_24h_norm = min(pluie_24h / 150 * 100, 100)
    
    # Normalisation des signalements
    # Référence : 10 signalements actifs = situation critique
    signalements_norm = min(signalements_actifs / 10 * 100, 100)
    
    score = (
        pluie_6h_norm * 0.30 +
        pluie_24h_norm * 0.25 +
        vulnerabilite * 100 * 0.25 +
        signalements_norm * 0.20
    )
    
    return round(min(score, 100), 2)

async def calculer_tous_les_scores():
    """
    Job principal — appelé toutes les 30 minutes par le scheduler.
    Calcule et sauvegarde le score de chaque quartier.
    """
    logger.info("Début calcul scores de risque...")
    
    try:
        # Récupération données météo
        meteo = await get_precipitation_data()
        pluie_6h = meteo["pluie_6h"]
        pluie_24h = meteo["pluie_24h"]
        
        quartiers = charger_quartiers()
        
        for quartier in quartiers:
            # Nombre de signalements actifs dans les 2 dernières heures
            signalements = supabase.table("signalements")\
                .select("id")\
                .eq("quartier_id", quartier["id"])\
                .eq("valide", True)\
                .gte("created_at", "now() - interval '2 hours'")\
                .execute()
            
            signalements_actifs = len(signalements.data)
            
            score = calculer_score(
                pluie_6h=pluie_6h,
                pluie_24h=pluie_24h,
                vulnerabilite=quartier["vulnerabilite"],
                signalements_actifs=signalements_actifs
            )
            
            niveau = determiner_niveau(score)
            
            # Sauvegarde dans Supabase
            supabase.table("scores_risque").insert({
                "quartier_id": quartier["id"],
                "score": score,
                "pluie_6h": pluie_6h,
                "pluie_24h": pluie_24h,
                "niveau": niveau
            }).execute()
            
            logger.info(f"{quartier['nom']} — Score: {score} — Niveau: {niveau}")
            
            # Déclenchement alertes SMS si niveau critique ou élevé
            if niveau in ["eleve", "critique"]:
                from services.sms import envoyer_alertes_quartier
                await envoyer_alertes_quartier(quartier["id"], quartier["nom"], niveau, score)
        
        logger.info("Calcul scores terminé avec succès")
        
    except Exception as e:
        logger.error(f"Erreur calcul scores: {str(e)}")