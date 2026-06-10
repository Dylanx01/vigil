"""
Script à exécuter UNE SEULE FOIS pour créer le compte admin mairie.
Usage : python seed_admin.py
"""
from supabase import create_client
from dotenv import load_dotenv
from services.auth import hash_password
import os

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def seed_admin():
    email = "admin@vigil.cm"
    password = "Vigil2026@CUD"
    nom_institution = "Communauté Urbaine de Douala"

    # Vérifie si admin existe déjà
    existant = supabase.table("admins")\
        .select("id")\
        .eq("email", email)\
        .execute()

    if existant.data:
        print(f"Admin existe déjà : {email}")
        return

    supabase.table("admins").insert({
        "email": email,
        "password_hash": hash_password(password),
        "nom_institution": nom_institution
    }).execute()

    print("✅ Admin créé avec succès")
    print(f"   Email    : {email}")
    print(f"   Password : {password}")
    print(f"   Institution : {nom_institution}")
    print("\n⚠️  Changez ce mot de passe en production.")

if __name__ == "__main__":
    seed_admin()