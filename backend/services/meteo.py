import httpx
import logging
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

DOUALA_LAT = 4.0511
DOUALA_LNG = 9.7679

async def get_precipitation_data(ville_id: str = "douala") -> dict:
    """
    Récupère les données de précipitation depuis Open-Meteo.
    Sauvegarde dans historique_meteo pour analyse long terme.
    """
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": DOUALA_LAT,
        "longitude": DOUALA_LNG,
        "hourly": "precipitation,temperature_2m,relative_humidity_2m",
        "timezone": "Africa/Douala",
        "forecast_days": 2,
        "past_days": 1
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            precipitations = data["hourly"]["precipitation"]
            temperatures = data["hourly"]["temperature_2m"]
            humidites = data["hourly"]["relative_humidity_2m"]

            pluie_1h = precipitations[-1]
            pluie_6h = sum(precipitations[-6:])
            pluie_24h = sum(precipitations[-24:])
            temperature = temperatures[-1]
            humidite = humidites[-1]

            logger.info(f"Météo récupérée — 1h: {pluie_1h}mm, 6h: {pluie_6h}mm, 24h: {pluie_24h}mm")

            # Sauvegarde historique
            try:
                supabase.table("historique_meteo").insert({
                    "ville_id": ville_id,
                    "pluie_1h": round(pluie_1h, 2),
                    "pluie_6h": round(pluie_6h, 2),
                    "pluie_24h": round(pluie_24h, 2),
                    "temperature": round(temperature, 1),
                    "humidite": round(humidite, 1)
                }).execute()
                logger.info("Historique météo sauvegardé")
            except Exception as e:
                logger.error(f"Erreur sauvegarde historique météo: {str(e)}")

            return {
                "pluie_1h": round(pluie_1h, 2),
                "pluie_6h": round(pluie_6h, 2),
                "pluie_24h": round(pluie_24h, 2),
                "temperature": round(temperature, 1),
                "humidite": round(humidite, 1)
            }

    except httpx.TimeoutException:
        logger.error("Timeout Open-Meteo API")
        return {"pluie_1h": 0.0, "pluie_6h": 0.0, "pluie_24h": 0.0, "temperature": 0.0, "humidite": 0.0}

    except httpx.HTTPStatusError as e:
        logger.error(f"Erreur HTTP Open-Meteo: {e.response.status_code}")
        return {"pluie_1h": 0.0, "pluie_6h": 0.0, "pluie_24h": 0.0, "temperature": 0.0, "humidite": 0.0}

    except Exception as e:
        logger.error(f"Erreur inattendue Open-Meteo: {str(e)}")
        return {"pluie_1h": 0.0, "pluie_6h": 0.0, "pluie_24h": 0.0, "temperature": 0.0, "humidite": 0.0}