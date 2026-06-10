import os
import random
import string
from datetime import datetime, timezone, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 1440))
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def create_token(data: dict, role: str) -> str:
    payload = data.copy()
    payload.update({
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    })
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None