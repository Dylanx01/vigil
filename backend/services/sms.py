import os
import httpx
import base64
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ORANGE_CLIENT_ID = os.getenv("ORANGE_CLIENT_ID")
ORANGE_CLIENT_SECRET = os.getenv("ORANGE_CLIENT_SECRET")
ORANGE_SENDER_NUMBER = os.getenv("ORANGE_SENDER_NUMBER")
ORANGE_TOKEN_URL = "https://api.orange.com/oauth/v3/token"
ORANGE_SMS_URL = "https://api.orange.com/smsmessaging/v1/outbound"

async def get_orange_token() -> str | None:
    """
    Récupère un token OAuth2 Orange.
    Le token est valide 90 jours.
    """
    try:
        credentials = f"{ORANGE_CLIENT_ID}:{ORANGE_CLIENT_SECRET}"
        encoded = base64.b64encode(credentials.encode()).decode()
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                ORANGE_TOKEN_URL,
                headers={
                    "Authorization": f"Basic {encoded}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data={"grant_type": "client_credentials"}
            )
            response.raise_for_status()
            token = response.json()["access_token"]
            logger.info("Token Orange récupéré avec succès")
            return token
            
    except Exception as e:
        logger.error(f"Erreur token Orange: {str(e)}")
        return None

async def envoyer_sms(telephone: str, message: str) -> bool:
    """
    Envoie un SMS à un numéro via Orange SMS API.
    Retourne True si succès, False sinon.
    """
    token = await get_orange_token()
    
    if not token:
        logger.error("Impossible d'envoyer SMS — token Orange non disponible")
        return False
    
    try:
        sender = f"tel:+{ORANGE_SENDER_NUMBER}"
        url = f"{ORANGE_SMS_URL}/{sender}/requests"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "outboundSMSMessageRequest": {
                        "address": f"tel:+{telephone}",
                        "senderAddress": sender,
                        "outboundSMSTextMessage": {
                            "message": message
                        }
                    }
                }
            )
            response.raise_for_status()
            logger.info(f"SMS envoyé avec succès à {telephone}")
            return True
            
    except Exception as e:
        logger.error(f"Erreur envoi SMS à {telephone}: {str(e)}")
        return False

async def envoyer_alertes_quartier(
    quartier_id: str,
    quartier_nom: str,
    niveau: str,
    score: float
) -> int:
    """
    Envoie des alertes SMS à tous les abonnés d'un quartier.
    Retourne le nombre de SMS envoyés avec succès.
    """
    import supabase as sb
    
    try:
        supabase = sb.create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
        
        # Récupération des abonnés actifs du quartier
        abonnes = supabase.table("abonnements")\
            .select("telephone")\
            .eq("quartier_id", quartier_id)\
            .eq("actif", True)\
            .execute()
        
        if not abonnes.data:
            logger.info(f"Aucun abonné pour {quartier_nom}")
            return 0
        
        niveau_texte = {
            "eleve": "ELEVE",
            "critique": "CRITIQUE"
        }.get(niveau, niveau.upper())

        message = (
            f"VIGIL - ALERTE {niveau_texte}\n"
            f"Quartier : {quartier_nom}\n"
            f"Score de risque : {score}/100\n"
            f"Risque d'inondation detecte.\n"
            f"Evitez les zones basses.\n"
            f"Restez en securite."
        )
        
        succes = 0
        for abonne in abonnes.data:
            envoye = await envoyer_sms(abonne["telephone"], message)
            if envoye:
                succes += 1
        
        # Sauvegarde dans l'historique des alertes
        supabase.table("alertes_envoyees").insert({
            "quartier_id": quartier_id,
            "nombre_sms": succes
        }).execute()
        
        logger.info(f"Alertes {quartier_nom} — {succes}/{len(abonnes.data)} SMS envoyés")
        return succes
        
    except Exception as e:
        logger.error(f"Erreur alertes quartier {quartier_nom}: {str(e)}")
        return 0