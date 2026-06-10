from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from services.auth import (
    hash_password,
    verify_password,
    generate_otp,
    create_token
)
from services.sms import envoyer_sms
import os

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# ─── Schémas ───────────────────────────────────────────

class CitoyenRegisterSchema(BaseModel):
    telephone: str
    nom: str | None = None
    quartier_id: str | None = None

class CitoyenVerifySchema(BaseModel):
    telephone: str
    otp: str

class CitoyenLoginSchema(BaseModel):
    telephone: str

class AdminLoginSchema(BaseModel):
    email: str
    password: str

# ─── Citoyen ───────────────────────────────────────────

@router.post("/citoyen/register")
async def citoyen_register(data: CitoyenRegisterSchema):
    """
    Inscription citoyen — envoie un OTP par SMS.
    """
    try:
        otp = generate_otp()
        otp_expires = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

        # Vérifie si le citoyen existe déjà
        existant = supabase.table("citoyens")\
            .select("id, verified")\
            .eq("telephone", data.telephone)\
            .execute()

        if existant.data:
            # Met à jour l'OTP
            supabase.table("citoyens")\
                .update({"otp": otp, "otp_expires_at": otp_expires})\
                .eq("telephone", data.telephone)\
                .execute()
        else:
            # Nouveau citoyen
            supabase.table("citoyens").insert({
                "telephone": data.telephone,
                "nom": data.nom,
                "quartier_id": data.quartier_id,
                "otp": otp,
                "otp_expires_at": otp_expires,
                "verified": False
            }).execute()

        # Envoi OTP par SMS
        message = (
            f"VIGIL - Code de verification\n"
            f"Votre code : {otp}\n"
            f"Valable 10 minutes."
        )
        await envoyer_sms(data.telephone, message)

        return {"message": "Code OTP envoyé par SMS"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/citoyen/verify")
async def citoyen_verify(data: CitoyenVerifySchema):
    """
    Vérification OTP — retourne un JWT si valide.
    """
    try:
        citoyen = supabase.table("citoyens")\
            .select("*")\
            .eq("telephone", data.telephone)\
            .execute()

        if not citoyen.data:
            raise HTTPException(status_code=404, detail="Numéro introuvable")

        c = citoyen.data[0]

        # Vérification OTP
        if c["otp"] != data.otp:
            raise HTTPException(status_code=400, detail="Code OTP incorrect")

        # Vérification expiration
        expires = datetime.fromisoformat(c["otp_expires_at"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Code OTP expiré")

        # Validation du citoyen
        supabase.table("citoyens")\
            .update({"verified": True, "otp": None})\
            .eq("telephone", data.telephone)\
            .execute()

        token = create_token(
            {"sub": data.telephone, "id": c["id"]},
            role="citoyen"
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "citoyen"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/citoyen/login")
async def citoyen_login(data: CitoyenLoginSchema):
    """
    Login citoyen — renvoie un OTP par SMS.
    """
    try:
        citoyen = supabase.table("citoyens")\
            .select("id, verified")\
            .eq("telephone", data.telephone)\
            .execute()

        if not citoyen.data:
            raise HTTPException(
                status_code=404,
                detail="Numéro non enregistré. Inscrivez-vous d'abord."
            )

        if not citoyen.data[0]["verified"]:
            raise HTTPException(
                status_code=400,
                detail="Numéro non vérifié. Terminez votre inscription."
            )

        otp = generate_otp()
        otp_expires = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

        supabase.table("citoyens")\
            .update({"otp": otp, "otp_expires_at": otp_expires})\
            .eq("telephone", data.telephone)\
            .execute()

        message = (
            f"VIGIL - Connexion\n"
            f"Votre code : {otp}\n"
            f"Valable 10 minutes."
        )
        await envoyer_sms(data.telephone, message)

        return {"message": "Code OTP envoyé par SMS"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Admin ─────────────────────────────────────────────

@router.post("/admin/login")
async def admin_login(data: AdminLoginSchema):
    """
    Login admin mairie — email + mot de passe.
    """
    try:
        admin = supabase.table("admins")\
            .select("*")\
            .eq("email", data.email)\
            .execute()

        if not admin.data:
            raise HTTPException(
                status_code=401,
                detail="Identifiants incorrects"
            )

        a = admin.data[0]

        if not verify_password(data.password, a["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Identifiants incorrects"
            )

        token = create_token(
            {"sub": a["email"], "id": a["id"], "institution": a["nom_institution"]},
            role="admin"
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "institution": a["nom_institution"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))