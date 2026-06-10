from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from middleware.auth import require_admin
from services.sms import envoyer_alertes_quartier
import os
import csv
import io

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class AlerteManuelleSchema(BaseModel):
    quartier_id: str
    message_custom: str | None = None

class ZoneRisqueSchema(BaseModel):
    quartier_id: str
    description: str
    raison: str
    niveau_minimum: str

class FeedbackSchema(BaseModel):
    quartier_id: str
    alerte_confirmee: bool
    commentaire: str | None = None

# ─── Stats ─────────────────────────────────────────────

@router.get("/stats")
async def get_stats(admin=Depends(require_admin)):
    try:
        deux_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

        abonnes = supabase.table("abonnements").select("id").eq("actif", True).execute()
        signalements_24h = supabase.table("signalements").select("id").gte("created_at", vingt_quatre_heures_avant).execute()
        signalements_actifs = supabase.table("signalements").select("id").eq("valide", True).gte("created_at", deux_heures_avant).execute()
        alertes = supabase.table("alertes_envoyees").select("nombre_sms").gte("triggered_at", vingt_quatre_heures_avant).execute()
        total_sms = sum(a["nombre_sms"] for a in alertes.data)
        quartiers_alerte = supabase.table("scores_risque").select("quartier_id, niveau, score").in_("niveau", ["eleve", "critique"]).gte("calculated_at", deux_heures_avant).execute()
        total_citoyens = supabase.table("citoyens").select("id").eq("verified", True).execute()
        total_feedbacks = supabase.table("feedbacks").select("id").gte("created_at", vingt_quatre_heures_avant).execute()

        return {
            "total_abonnes": len(abonnes.data),
            "total_citoyens_inscrits": len(total_citoyens.data),
            "signalements_24h": len(signalements_24h.data),
            "signalements_actifs": len(signalements_actifs.data),
            "sms_envoyes_24h": total_sms,
            "quartiers_en_alerte": len(quartiers_alerte.data),
            "quartiers_alerte_detail": quartiers_alerte.data,
            "feedbacks_24h": len(total_feedbacks.data)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Heatmap ───────────────────────────────────────────

@router.get("/heatmap")
async def get_heatmap(admin=Depends(require_admin)):
    try:
        quartiers = supabase.table("quartiers").select("*").execute()
        heatmap = []

        for q in quartiers.data:
            dernier = supabase.table("scores_risque").select("score, niveau, calculated_at").eq("quartier_id", q["id"]).order("calculated_at", desc=True).limit(1).execute()
            score_data = dernier.data[0] if dernier.data else {"score": 0, "niveau": "faible", "calculated_at": None}

            zones = supabase.table("zones_risque_permanent").select("niveau_minimum").eq("quartier_id", q["id"]).execute()

            heatmap.append({
                "quartier_id": q["id"],
                "nom": q["nom"],
                "lat": q["lat"],
                "lng": q["lng"],
                "vulnerabilite": q["vulnerabilite"],
                "score": score_data["score"],
                "niveau": score_data["niveau"],
                "calculated_at": score_data["calculated_at"],
                "zone_risque_permanent": len(zones.data) > 0
            })

        return {"heatmap": heatmap}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Signalements ──────────────────────────────────────

@router.get("/signalements")
async def get_tous_signalements(admin=Depends(require_admin)):
    try:
        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        response = supabase.table("signalements").select("*").gte("created_at", vingt_quatre_heures_avant).order("created_at", desc=True).execute()
        return {"signalements": response.data, "total": len(response.data)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Abonnés ───────────────────────────────────────────

@router.get("/abonnes")
async def get_abonnes_par_quartier(admin=Depends(require_admin)):
    try:
        quartiers = supabase.table("quartiers").select("*").execute()
        result = []

        for q in quartiers.data:
            count = supabase.table("abonnements").select("id").eq("quartier_id", q["id"]).eq("actif", True).execute()
            result.append({
                "quartier_id": q["id"],
                "nom": q["nom"],
                "abonnes": len(count.data)
            })

        return {"abonnes_par_quartier": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Evolution ─────────────────────────────────────────

@router.get("/evolution")
async def get_evolution(admin=Depends(require_admin)):
    try:
        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        response = supabase.table("scores_risque").select("quartier_id, score, niveau, calculated_at").gte("calculated_at", vingt_quatre_heures_avant).order("calculated_at", desc=False).execute()
        return {"evolution": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Historique alertes ────────────────────────────────

@router.get("/alertes/historique")
async def get_historique_alertes(admin=Depends(require_admin)):
    try:
        sept_jours_avant = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

        alertes = supabase.table("alertes_envoyees")\
            .select("*, quartiers(nom)")\
            .gte("triggered_at", sept_jours_avant)\
            .order("triggered_at", desc=True)\
            .execute()

        return {
            "alertes": alertes.data,
            "total": len(alertes.data)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Export CSV ────────────────────────────────────────

@router.get("/export/signalements")
async def export_signalements_csv(admin=Depends(require_admin)):
    try:
        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        data = supabase.table("signalements").select("*").gte("created_at", vingt_quatre_heures_avant).execute()

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["id", "quartier_id", "lat", "lng", "niveau_eau", "description", "valide", "created_at"])
        writer.writeheader()

        for row in data.data:
            writer.writerow({
                "id": row["id"],
                "quartier_id": row["quartier_id"],
                "lat": row["lat"],
                "lng": row["lng"],
                "niveau_eau": row["niveau_eau"],
                "description": row.get("description", ""),
                "valide": row["valide"],
                "created_at": row["created_at"]
            })

        output.seek(0)

        # Log export
        supabase.table("export_logs").insert({
            "admin_id": admin["id"],
            "type_export": "signalements"
        }).execute()

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=signalements_vigil.csv"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/scores")
async def export_scores_csv(admin=Depends(require_admin)):
    try:
        vingt_quatre_heures_avant = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        data = supabase.table("scores_risque").select("*").gte("calculated_at", vingt_quatre_heures_avant).execute()

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["quartier_id", "score", "niveau", "pluie_6h", "pluie_24h", "calculated_at"])
        writer.writeheader()

        for row in data.data:
            writer.writerow({
                "quartier_id": row["quartier_id"],
                "score": row["score"],
                "niveau": row["niveau"],
                "pluie_6h": row["pluie_6h"],
                "pluie_24h": row["pluie_24h"],
                "calculated_at": row["calculated_at"]
            })

        output.seek(0)

        supabase.table("export_logs").insert({
            "admin_id": admin["id"],
            "type_export": "scores"
        }).execute()

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=scores_vigil.csv"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Zones risque permanent ────────────────────────────

@router.post("/zones-risque")
async def creer_zone_risque(data: ZoneRisqueSchema, admin=Depends(require_admin)):
    try:
        niveaux_valides = ["faible", "modere", "eleve", "critique"]
        if data.niveau_minimum not in niveaux_valides:
            raise HTTPException(status_code=400, detail="Niveau invalide")

        result = supabase.table("zones_risque_permanent").insert({
            "quartier_id": data.quartier_id,
            "description": data.description,
            "raison": data.raison,
            "niveau_minimum": data.niveau_minimum,
            "created_by": admin["id"]
        }).execute()

        return {"message": "Zone de risque créée", "data": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zones-risque")
async def get_zones_risque(admin=Depends(require_admin)):
    try:
        response = supabase.table("zones_risque_permanent").select("*").execute()
        return {"zones": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Villes ────────────────────────────────────────────

@router.get("/villes")
async def get_villes(admin=Depends(require_admin)):
    try:
        response = supabase.table("villes").select("*").execute()
        return {"villes": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Alerte manuelle ───────────────────────────────────

@router.post("/alerte")
async def declenchement_manuel(data: AlerteManuelleSchema, admin=Depends(require_admin)):
    try:
        quartier = supabase.table("quartiers").select("*").eq("id", data.quartier_id).execute()

        if not quartier.data:
            raise HTTPException(status_code=404, detail="Quartier introuvable")

        q = quartier.data[0]
        nb_sms = await envoyer_alertes_quartier(
            quartier_id=q["id"],
            quartier_nom=q["nom"],
            niveau="critique",
            score=100
        )

        return {
            "message": f"Alerte manuelle déclenchée pour {q['nom']}",
            "sms_envoyes": nb_sms
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # ─── Gestion admins ────────────────────────────────────

class NouvelAdminSchema(BaseModel):
    email: str
    password: str
    nom_institution: str
    niveau: str = "ville"
    ville_id: str | None = None

@router.post("/admins")
async def creer_admin(data: NouvelAdminSchema, admin=Depends(require_admin)):
    """
    Crée un nouveau compte admin.
    Réservé au superadmin uniquement.
    """
    try:
        if admin.get("niveau") != "superadmin":
            raise HTTPException(
                status_code=403,
                detail="Seul le superadmin peut créer des comptes admin"
            )

        existant = supabase.table("admins")\
            .select("id")\
            .eq("email", data.email)\
            .execute()

        if existant.data:
            raise HTTPException(
                status_code=400,
                detail="Un admin avec cet email existe déjà"
            )

        from services.auth import hash_password

        result = supabase.table("admins").insert({
            "email": data.email,
            "password_hash": hash_password(data.password),
            "nom_institution": data.nom_institution,
            "niveau": data.niveau,
            "ville_id": data.ville_id
        }).execute()

        return {
            "message": "Admin créé avec succès",
            "email": data.email,
            "institution": data.nom_institution
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admins")
async def get_admins(admin=Depends(require_admin)):
    """
    Liste tous les admins.
    Réservé au superadmin.
    """
    try:
        if admin.get("niveau") != "superadmin":
            raise HTTPException(
                status_code=403,
                detail="Accès réservé au superadmin"
            )

        response = supabase.table("admins")\
            .select("id, email, nom_institution, niveau, ville_id, created_at")\
            .execute()

        return {
            "admins": response.data,
            "total": len(response.data)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))