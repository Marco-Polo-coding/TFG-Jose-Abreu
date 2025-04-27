import os
from typing import Dict
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import firebase_admin
from firebase_admin import auth
import httpx
from dotenv import load_dotenv
import logging

from firebase_config import db

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register_user(user: UserRegister):
    try:
        user_record = auth.create_user(
            email=user.email,
            password=user.password
        )
        
        # Guardar información adicional en Firestore
        user_data = {
            "uid": user_record.uid,
            "email": user.email
        }
        db.collection("usuarios").document(user_record.uid).set(user_data)
        
        return {"message": "Usuario registrado con éxito"}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/login")
async def login_user(user: UserLogin) -> Dict[str, str]:
    try:
        # Verificar que FIREBASE_API_KEY esté configurada
        firebase_api_key = os.getenv('FIREBASE_API_KEY')
        if not firebase_api_key:
            logger.error("FIREBASE_API_KEY no está configurada en el archivo .env")
            raise HTTPException(
                status_code=500,
                detail="Error de configuración del servidor"
            )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}",
                json={
                    "email": user.email,
                    "password": user.password,
                    "returnSecureToken": True
                }
            )
            
            # Log de la respuesta de Firebase para depuración
            logger.info(f"Respuesta de Firebase: {response.text}")
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Error de autenticación')
                logger.error(f"Error de Firebase: {error_message}")
                
                # Mapear códigos de error comunes de Firebase a códigos HTTP apropiados
                if 'INVALID_PASSWORD' in error_message or 'EMAIL_NOT_FOUND' in error_message:
                    raise HTTPException(
                        status_code=401,
                        detail="Credenciales inválidas"
                    )
                elif 'TOO_MANY_ATTEMPTS_TRY_LATER' in error_message:
                    raise HTTPException(
                        status_code=429,
                        detail="Demasiados intentos. Por favor, intente más tarde"
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=error_message
                    )
            
            data = response.json()
            return {
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        ) 