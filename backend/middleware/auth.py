from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth import verify_token

security = HTTPBearer()

def require_auth(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Vérifie le JWT — utilisable sur n'importe quel endpoint.
    Retourne le payload du token si valide.
    """
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token invalide ou expiré"
        )

    return payload

def require_admin(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Vérifie le JWT ET que le rôle est admin.
    Utilisé sur tous les endpoints du portail mairie.
    """
    payload = require_auth(credentials)

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Accès refusé — droits administrateur requis"
        )

    return payload

def require_citoyen(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Vérifie le JWT ET que le rôle est citoyen.
    """
    payload = require_auth(credentials)

    if payload.get("role") != "citoyen":
        raise HTTPException(
            status_code=403,
            detail="Accès refusé"
        )

    return payload