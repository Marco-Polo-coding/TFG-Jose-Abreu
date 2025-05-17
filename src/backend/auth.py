import os
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, Depends, Body, File, UploadFile, Form
from pydantic import BaseModel, EmailStr
import firebase_admin
from firebase_admin import auth
import httpx
from dotenv import load_dotenv
import logging
import base64

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

class PasswordReset(BaseModel):
    email: EmailStr

class ConfirmPasswordReset(BaseModel):
    oobCode: str
    newPassword: str

class DirectPasswordReset(BaseModel):
    email: EmailStr
    newPassword: str

class UserProfileUpdate(BaseModel):
    uid: str
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    foto: Optional[str] = None  # base64 o url

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
            # Obtener el usuario de Firebase
            user_record = auth.get_user_by_email(user.email)
            return {
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"],
                "email": user.email,
                "nombre": user_record.display_name or "",
                "uid": user_record.uid
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@router.post("/google")
async def login_with_google(id_token: str = Body(..., embed=True)):
    try:
        # Verificar que FIREBASE_API_KEY esté configurada
        firebase_api_key = os.getenv('FIREBASE_API_KEY')
        if not firebase_api_key:
            logger.error("FIREBASE_API_KEY no está configurada en el archivo .env")
            raise HTTPException(
                status_code=500,
                detail="Error de configuración del servidor"
            )

        # Intercambiar el token de Google por un token de Firebase
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key={firebase_api_key}",
                json={
                    "postBody": f"id_token={id_token}&providerId=google.com",
                    "requestUri": "http://localhost:4321",
                    "returnIdpCredential": True,
                    "returnSecureToken": True
                }
            )

            if response.status_code != 200:
                logger.error(f"Error al verificar token con Firebase: {response.text}")
                raise HTTPException(
                    status_code=401,
                    detail="Token de Google inválido o expirado"
                )

            data = response.json()
            
            # Obtener datos del usuario
            user_info = {
                "uid": data.get("localId"),
                "email": data.get("email"),
                "nombre": data.get("displayName", ""),
                "foto": data.get("photoUrl", "")
            }

            # Guardar o actualizar usuario en Firestore
            user_ref = db.collection("usuarios").document(user_info["uid"])
            user_ref.set(user_info, merge=True)

            return {
                "idToken": data.get("idToken"),
                "refreshToken": data.get("refreshToken"),
                "email": user_info["email"],
                "nombre": user_info["nombre"],
                "uid": user_info["uid"],
                "foto": user_info["foto"]
            }

    except Exception as e:
        logger.error(f"Error en login con Google: {str(e)}")
        raise HTTPException(status_code=401, detail="Error al procesar el login con Google")

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    try:
        # Generar el enlace de restablecimiento de contraseña
        reset_link = auth.generate_password_reset_link(reset_data.email)
        
        # Aquí podrías enviar el email con el enlace usando un servicio de email
        # Por ahora solo retornamos el enlace (en producción deberías enviarlo por email)
        return {
            "message": "Se ha enviado un enlace de restablecimiento a tu correo electrónico",
            "reset_link": reset_link  # En producción, no devolver el enlace directamente
        }
    except Exception as e:
        logger.error(f"Error al restablecer contraseña: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error al procesar la solicitud de restablecimiento de contraseña"
        )

@router.post("/confirm-reset-password")
async def confirm_reset_password(reset_data: ConfirmPasswordReset):
    try:
        # Verificar y aplicar el restablecimiento de contraseña
        auth.confirm_password_reset(reset_data.oobCode, reset_data.newPassword)
        
        return {
            "message": "Contraseña restablecida con éxito"
        }
    except Exception as e:
        logger.error(f"Error al confirmar restablecimiento de contraseña: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error al restablecer la contraseña. El enlace puede haber expirado o ser inválido."
        )

@router.post("/direct-reset-password")
async def direct_reset_password(reset_data: DirectPasswordReset):
    try:
        # Verificar si el email existe
        try:
            user = auth.get_user_by_email(reset_data.email)
        except auth.UserNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="No existe una cuenta con este email"
            )

        # Actualizar la contraseña directamente
        auth.update_user(
            user.uid,
            password=reset_data.newPassword
        )
        
        return {
            "message": "Contraseña actualizada con éxito"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar contraseña: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error al actualizar la contraseña"
        )

@router.put("/update-profile")
async def update_profile(
    uid: str = Form(...),
    nombre: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    foto: Optional[UploadFile] = File(None)
):
    try:
        user = auth.get_user(uid)
        update_data = {}
        firestore_data = {}
        if nombre:
            update_data["display_name"] = nombre
            firestore_data["nombre"] = nombre
        if email and email != user.email:
            update_data["email"] = email
            firestore_data["email"] = email
        if foto:
            # Validar tipo y tamaño
            if foto.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif"]:
                raise HTTPException(status_code=400, detail="Tipo de imagen no soportado")
            contents = await foto.read()
            if len(contents) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="La imagen supera los 10MB")
            # Guardar como base64 (o podrías subir a Cloudinary y guardar la URL)
            foto_b64 = base64.b64encode(contents).decode("utf-8")
            firestore_data["foto"] = foto_b64
        # Actualizar en Firebase Auth
        if update_data:
            auth.update_user(uid, **update_data)
        # Actualizar en Firestore
        if firestore_data:
            db.collection("usuarios").document(uid).set(firestore_data, merge=True)
        return {"message": "Perfil actualizado con éxito", "data": firestore_data}
    except Exception as e:
        logger.error(f"Error al actualizar perfil: {str(e)}")
        raise HTTPException(status_code=400, detail="Error al actualizar el perfil") 