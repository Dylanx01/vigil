"""
Script de seed data pour la démo hackathon.
Simule une situation d'inondation réaliste à Douala.
Usage : python seed_demo.py
"""
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import os

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def seed_demo():
    print("Injection des données de démo...")

    now = datetime.now(timezone.utc)

    # Scores simulant une situation de pluies intenses
    scores_demo = [
        {"quartier_id": "new-bell", "score": 87.5, "pluie_6h": 52.0, "pluie_24h": 89.0, "niveau": "critique"},
        {"quartier_id": "bonaberi", "score": 84.2, "pluie_6h": 48.0, "pluie_24h": 82.0, "niveau": "critique"},
        {"quartier_id": "makepe", "score": 79.8, "pluie_6h": 44.0, "pluie_24h": 76.0, "niveau": "critique"},
        {"quartier_id": "ndokotti", "score": 76.3, "pluie_6h": 41.0, "pluie_24h": 71.0, "niveau": "critique"},
        {"quartier_id": "mabanda", "score": 73.1, "pluie_6h": 38.0, "pluie_24h": 68.0, "niveau": "eleve"},
        {"quartier_id": "ndog-bong", "score": 71.4, "pluie_6h": 36.0, "pluie_24h": 65.0, "niveau": "eleve"},
        {"quartier_id": "bassa", "score": 68.9, "pluie_6h": 34.0, "pluie_24h": 61.0, "niveau": "eleve"},
        {"quartier_id": "ndogpassi", "score": 65.2, "pluie_6h": 31.0, "pluie_24h": 57.0, "niveau": "eleve"},
        {"quartier_id": "bonamoussadi", "score": 58.7, "pluie_6h": 27.0, "pluie_24h": 49.0, "niveau": "modere"},
        {"quartier_id": "deido", "score": 54.3, "pluie_6h": 24.0, "pluie_24h": 44.0, "niveau": "modere"},
        {"quartier_id": "kotto", "score": 51.8, "pluie_6h": 22.0, "pluie_24h": 41.0, "niveau": "modere"},
        {"quartier_id": "mboppi", "score": 48.6, "pluie_6h": 20.0, "pluie_24h": 38.0, "niveau": "modere"},
        {"quartier_id": "sodiko", "score": 46.2, "pluie_6h": 19.0, "pluie_24h": 35.0, "niveau": "modere"},
        {"quartier_id": "pk8", "score": 43.5, "pluie_6h": 18.0, "pluie_24h": 32.0, "niveau": "modere"},
        {"quartier_id": "logbessou", "score": 38.4, "pluie_6h": 15.0, "pluie_24h": 27.0, "niveau": "modere"},
        {"quartier_id": "nkongmondo", "score": 34.2, "pluie_6h": 12.0, "pluie_24h": 22.0, "niveau": "modere"},
        {"quartier_id": "bali", "score": 28.7, "pluie_6h": 9.0, "pluie_24h": 17.0, "niveau": "faible"},
        {"quartier_id": "akwa", "score": 22.1, "pluie_6h": 7.0, "pluie_24h": 13.0, "niveau": "faible"},
        {"quartier_id": "bonapriso", "score": 18.5, "pluie_6h": 5.0, "pluie_24h": 10.0, "niveau": "faible"},
        {"quartier_id": "ange-raphael", "score": 21.3, "pluie_6h": 6.0, "pluie_24h": 12.0, "niveau": "faible"},
        {"quartier_id": "brazzaville", "score": 32.4, "pluie_6h": 11.0, "pluie_24h": 20.0, "niveau": "modere"},
        {"quartier_id": "pk10", "score": 41.2, "pluie_6h": 17.0, "pluie_24h": 30.0, "niveau": "modere"},
        {"quartier_id": "pk14", "score": 35.8, "pluie_6h": 13.0, "pluie_24h": 24.0, "niveau": "modere"},
        {"quartier_id": "yassa", "score": 29.4, "pluie_6h": 10.0, "pluie_24h": 18.0, "niveau": "faible"},
        {"quartier_id": "japoma", "score": 24.6, "pluie_6h": 8.0, "pluie_24h": 15.0, "niveau": "faible"},
    ]

    for score in scores_demo:
        supabase.table("scores_risque").insert({
            **score,
            "calculated_at": now.isoformat()
        }).execute()

    print(f"✅ {len(scores_demo)} scores injectés")

    # Signalements citoyens simulés
    signalements_demo = [
        {"quartier_id": "new-bell", "lat": 4.0489, "lng": 9.6921, "niveau_eau": "taille", "description": "Rue principale complètement inondée", "valide": True},
        {"quartier_id": "new-bell", "lat": 4.0501, "lng": 9.6934, "niveau_eau": "genou", "description": "Eau monte rapidement", "valide": True},
        {"quartier_id": "new-bell", "lat": 4.0478, "lng": 9.6908, "niveau_eau": "taille", "description": "Impossible de circuler", "valide": True},
        {"quartier_id": "bonaberi", "lat": 4.0673, "lng": 9.6543, "niveau_eau": "genou", "description": "Quartier Bépanda inondé", "valide": True},
        {"quartier_id": "bonaberi", "lat": 4.0689, "lng": 9.6558, "niveau_eau": "taille", "description": "Eau entre dans les maisons", "valide": True},
        {"quartier_id": "makepe", "lat": 4.0731, "lng": 9.7478, "niveau_eau": "cheville", "description": "Début d'inondation", "valide": False},
        {"quartier_id": "ndokotti", "lat": 4.0412, "lng": 9.7103, "niveau_eau": "genou", "description": "Carrefour Ndokotti sous l'eau", "valide": True},
        {"quartier_id": "mabanda", "lat": 4.0712, "lng": 9.6623, "niveau_eau": "cheville", "description": "Rues boueuses", "valide": False},
    ]

    for s in signalements_demo:
        supabase.table("signalements").insert({
            **s,
            "ip_hash": "demo_seed_hash",
            "created_at": (now - timedelta(minutes=15)).isoformat()
        }).execute()

    print(f"✅ {len(signalements_demo)} signalements injectés")

    # Abonné de test
    supabase.table("abonnements").insert({
        "telephone": "+237659051259",
        "quartier_id": "new-bell",
        "actif": True
    }).execute()

    print("✅ Abonné de test injecté")
    print("\n🎯 Données de démo prêtes pour le hackathon !")
    print("\nSituation simulée :")
    print("  - 4 quartiers CRITIQUES : New Bell, Bonabéri, Makepe, Ndokotti")
    print("  - 4 quartiers ÉLEVÉS : Mabanda, Ndog-Bong, Bassa, Ndogpassi")
    print("  - 10 quartiers MODÉRÉS")
    print("  - 7 quartiers FAIBLES")

if __name__ == "__main__":
    seed_demo()