import httpx
import logging

logger = logging.getLogger(__name__)

# Coordonnées centre de Douala
DOUALA_LAT = 4.0511
DOUALA_LNG = 9.7679

async def get_precipitation_data() -> dict:
    """
    Récupère les données de précipitation depuis Open-Meteo.
    Retourne pluie_6h et pluie_24h en millimètres.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    
    params = {
        "latitude": DOUALA_LAT,
        "longitude": DOUALA_LNG,
        "hourly": "precipitation",
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
            
            # Pluie des 6 dernières heures
            pluie_6h = sum(precipitations[-6:])
            
            # Pluie des 24 dernières heures
            pluie_24h = sum(precipitations[-24:])
            
            logger.info(f"Météo récupérée — 6h: {pluie_6h}mm, 24h: {pluie_24h}mm")
            
            return {
                "pluie_6h": round(pluie_6h, 2),
                "pluie_24h": round(pluie_24h, 2)
            }
            
    except httpx.TimeoutException:
        logger.error("Timeout Open-Meteo API")
        return {"pluie_6h": 0.0, "pluie_24h": 0.0}
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Erreur HTTP Open-Meteo: {e.response.status_code}")
        return {"pluie_6h": 0.0, "pluie_24h": 0.0}
        
    except Exception as e:
        logger.error(f"Erreur inattendue Open-Meteo: {str(e)}")
        return {"pluie_6h": 0.0, "pluie_24h": 0.0}