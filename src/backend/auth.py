import os
from typing import Dict, Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body, File, UploadFile, Form, WebSocket
from pydantic import BaseModel, EmailStr
import firebase_admin
from firebase_admin import auth
import httpx
from dotenv import load_dotenv
import logging
import base64
import cloudinary
import json

from firebase_config import db

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auth.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Función para sanitizar datos sensibles en logs
def sanitize_log_data(data):
    if isinstance(data, dict):
        return {k: '***' if k in ['password', 'token', 'api_key'] else v for k, v in data.items()}
    return data

# Cargar variables de entorno desde el archivo .env en la raíz del proyecto
load_dotenv(dotenv_path="../../.env")

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    foto: Optional[str] = None

    class Config:
        extra = "ignore"  # Ignorar campos extra en la petición

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nombre: Optional[str] = None
    biografia: Optional[str] = None
    role: Optional[str] = "user"  # Por defecto será "user"
    seguidores: Optional[List[str]] = []  # Lista de UIDs de seguidores
    seguidos: Optional[List[str]] = []  # Lista de UIDs de usuarios seguidos

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
    biografia: Optional[str] = None
    role: Optional[str] = None

class DeleteAccount(BaseModel):
    uid: str
    email: EmailStr

class ProfileWithPasswordUpdate(BaseModel):
    uid: str
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    newPassword: Optional[str] = None
    biografia: Optional[str] = None

class FollowRequest(BaseModel):
    current_user_uid: str

@router.post("/register")
async def register_user(user: UserRegister):
    try:
        # Crear usuario en Firebase Auth
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.nombre or ""
        )
        
        # Guardar información adicional en Firestore
        user_data = {
            "uid": user_record.uid,
            "email": user.email,
            "nombre": user.nombre or "",
            "biografia": user.biografia or "",
            "role": user.role or "user",
            "seguidores": user.seguidores or [],
            "seguidos": user.seguidos or []
        }
        db.collection("usuarios").document(user_record.uid).set(user_data)
        
        # Autenticar automáticamente al usuario después del registro
        # usando la misma lógica que el login
        firebase_api_key = os.getenv('FIREBASE_API_KEY')
        if not firebase_api_key:
            logger.error("FIREBASE_API_KEY no está configurada en el archivo .env")
            raise HTTPException(
                status_code=500,
                detail="Error de configuración del servidor"
            )

        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}",
                json={
                    "email": user.email,
                    "password": user.password,
                    "returnSecureToken": True
                }
            )
            
            if auth_response.status_code != 200:
                # Si falla la autenticación automática, al menos el usuario se creó
                logger.warning(f"Usuario creado pero falló la autenticación automática: {auth_response.text}")
                return {"message": "Usuario registrado con éxito", "nombre": user.nombre or ""}
            
            auth_data = auth_response.json()
            
            # Devolver los mismos datos que el login para mantener al usuario autenticado
            response_data = {
                "idToken": auth_data["idToken"],
                "refreshToken": auth_data["refreshToken"],
                "email": user.email,
                "nombre": user.nombre or "",
                "uid": user_record.uid,
                "foto": "",  # Nuevo usuario no tiene foto aún
                "role": user.role or "user",
                "message": "Usuario registrado e iniciado sesión exitosamente"
            }
            
            logger.info(f"Usuario registrado y autenticado automáticamente: {user.email}")
            return response_data
        
    except Exception as e:
        logger.error(f"Error en registro: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/login")
async def login_user(user: UserLogin) -> Dict[str, str]:
    try:
        logger.info(f"Intento de login para email: {user.email}")
        
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
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Error de autenticación')
                logger.error(f"Error de Firebase: {error_message}")
                
                if 'INVALID_PASSWORD' in error_message or 'EMAIL_NOT_FOUND' in error_message:
                    raise HTTPException(
                        status_code=401,
                        detail="Email o contraseña incorrectos"
                    )
                elif 'TOO_MANY_ATTEMPTS_TRY_LATER' in error_message:
                    raise HTTPException(
                        status_code=429,
                        detail="Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentarlo de nuevo"
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Error al iniciar sesión. Por favor, inténtalo de nuevo"
                    )
            
            data = response.json()
            logger.info(f"Login exitoso para usuario: {user.email}")
            
            # Obtener el usuario de Firebase
            user_record = auth.get_user_by_email(user.email)
            # Obtener la foto de perfil y rol desde Firestore            user_doc = db.collection("usuarios").document(user_record.uid).get()
            foto_url = ""
            role = "user"
            biografia = ""
            if user_doc.exists:
                user_data = user_doc.to_dict()
                foto_url = user_data.get("foto", "") or ""
                role = user_data.get("role", "user")
                biografia = user_data.get("biografia", "") or ""
                logger.info(f"Rol del usuario: {role}")  # Log del rol
            
            response_data = {
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"],
                "email": user.email,
                "nombre": user_record.display_name or "",
                "uid": user_record.uid,
                "foto": foto_url,
                "role": role,
                "biografia": biografia
            }
            logger.info(f"Datos de respuesta: {sanitize_log_data(response_data)}")  # Log de la respuesta completa
            return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde"
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

            data = response.json()            # Obtener datos del usuario
            user_info = {
                "uid": data.get("localId"),
                "email": data.get("email"),
                "nombre": data.get("displayName", ""),
            }

            # Verificar si el usuario ya existe para preservar su foto personalizada
            user_ref = db.collection("usuarios").document(user_info["uid"])
            existing_user = user_ref.get()
            
            if existing_user.exists:
                # Usuario existente - preservar foto personalizada
                user_ref.set(user_info, merge=True)
                # Obtener datos actualizados incluyendo la foto existente
                updated_user = user_ref.get().to_dict()                return {
                    "idToken": data.get("idToken"),
                    "refreshToken": data.get("refreshToken"),
                    "email": updated_user.get("email"),
                    "nombre": updated_user.get("nombre"),
                    "uid": updated_user.get("uid"),
                    "foto": updated_user.get("foto", ""),
                    "biografia": updated_user.get("biografia", ""),
                    "role": updated_user.get("role", "user")
                }
            else:                # Usuario nuevo - establecer campos iniciales
                user_info["foto"] = ""
                user_info["biografia"] = ""
                user_info["role"] = "user"
                user_ref.set(user_info, merge=True)
                return {
                    "idToken": data.get("idToken"),
                    "refreshToken": data.get("refreshToken"),
                    "email": user_info["email"],
                    "nombre": user_info["nombre"],
                    "uid": user_info["uid"],
                    "foto": user_info["foto"],
                    "biografia": user_info["biografia"],
                    "role": user_info["role"]
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
    foto: Optional[UploadFile] = File(None),
    biografia: Optional[str] = Form(None),
    delete_photo: Optional[str] = Form(None)
):
    try:
        logger.info(f"Updating profile for UID: {uid}")
        logger.info(f"Received data - nombre: {nombre}, email: {email}, biografia: {biografia}, delete_photo: {delete_photo}")
        
        user = auth.get_user(uid)
        logger.info(f"Found user: {user.email}")
        
        update_data = {}
        firestore_data = {}
        if nombre:
            update_data["display_name"] = nombre
            firestore_data["nombre"] = nombre
        # Solo actualizar el email si realmente ha cambiado y no existe ya
        if email and email != user.email:
            # Verificar si el email ya existe en Firebase
            try:
                auth.get_user_by_email(email)
                raise HTTPException(status_code=400, detail="El email ya está en uso por otro usuario")
            except auth.UserNotFoundError:
                update_data["email"] = email
                firestore_data["email"] = email
        if biografia is not None:
            firestore_data["biografia"] = biografia

        # Manejar la foto de perfil
        if delete_photo == 'true':
            # Eliminar la foto actual
            firestore_data["foto"] = None
        elif foto:
            # Validar tipo y tamaño
            if foto.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif"]:
                raise HTTPException(status_code=400, detail="Tipo de imagen no soportado")
            contents = await foto.read()
            if len(contents) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="La imagen supera los 10MB")
            # Subir a Cloudinary
            try:
                result = cloudinary.uploader.upload(
                    contents,
                    folder="profile_images",
                    resource_type="auto"
                )
                firestore_data["foto"] = result["secure_url"]
            except Exception as img_err:
                logger.error(f"Error subiendo imagen a Cloudinary: {str(img_err)}")
                raise HTTPException(status_code=400, detail="Error al subir la imagen")

        # Actualizar en Firebase Auth
        if update_data:
            auth.update_user(uid, **update_data)
            logger.info(f"Updated Firebase Auth for user {uid}")        # Actualizar en Firestore
        if firestore_data:
            # Obtener el documento actual para preservar datos no actualizados
            current_doc = db.collection("usuarios").document(uid).get()
            current_data = current_doc.to_dict() if current_doc.exists else {}
            # Combinar datos actuales con nuevos datos
            updated_data = {**current_data, **firestore_data}
            db.collection("usuarios").document(uid).set(updated_data, merge=True)
            logger.info(f"Updated Firestore for user {uid}")
        
        logger.info(f"Profile update successful for user {uid}")
        
        # Obtener los datos actualizados para retornar al frontend
        updated_doc = db.collection("usuarios").document(uid).get()
        updated_user_data = updated_doc.to_dict() if updated_doc.exists else {}
        
        return {"message": "Perfil actualizado con éxito", "data": updated_user_data}
    except HTTPException as he:
        logger.error(f"HTTP Exception in update_profile: {he.detail}")
        raise he
    except auth.UserNotFoundError:
        logger.error(f"User not found: {uid}")
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except Exception as e:
        logger.error(f"Error al actualizar perfil: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        raise HTTPException(status_code=400, detail="Error al actualizar el perfil")

@router.put("/update-profile-with-password")
async def update_profile_with_password(
    uid: str = Form(...),
    nombre: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    password: Optional[str] = Form(None),
    foto: Optional[UploadFile] = File(None),
    biografia: Optional[str] = Form(None),
    delete_photo: Optional[str] = Form(None)
):
    try:
        logger.info(f"Updating profile with password for UID: {uid}")
        
        user = auth.get_user(uid)
        logger.info(f"Found user: {user.email}")
        
        update_data = {}
        firestore_data = {}
        
        # Preparar datos para Firebase Auth
        if nombre:
            update_data["display_name"] = nombre
            firestore_data["nombre"] = nombre
            
        # Solo actualizar el email si realmente ha cambiado y no existe ya
        if email and email != user.email:
            # Verificar si el email ya existe en Firebase
            try:
                auth.get_user_by_email(email)
                raise HTTPException(status_code=400, detail="El email ya está en uso por otro usuario")
            except auth.UserNotFoundError:
                update_data["email"] = email
                firestore_data["email"] = email
                
        # Agregar contraseña si se proporciona
        if password:
            update_data["password"] = password
            
        if biografia is not None:
            firestore_data["biografia"] = biografia

        # Manejar la foto de perfil
        if delete_photo == 'true':
            # Eliminar la foto actual
            firestore_data["foto"] = None
        elif foto:
            # Validar tipo y tamaño
            if foto.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif"]:
                raise HTTPException(status_code=400, detail="Tipo de imagen no soportado")
            contents = await foto.read()
            if len(contents) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="La imagen supera los 10MB")
            # Subir a Cloudinary
            try:
                result = cloudinary.uploader.upload(
                    contents,
                    folder="profile_images",
                    resource_type="auto"
                )
                firestore_data["foto"] = result["secure_url"]
            except Exception as img_err:
                logger.error(f"Error subiendo imagen a Cloudinary: {str(img_err)}")
                raise HTTPException(status_code=400, detail="Error al subir la imagen")

        # Actualizar en Firebase Auth (email, nombre y contraseña en una sola operación)
        if update_data:
            auth.update_user(uid, **update_data)
            logger.info(f"Updated Firebase Auth for user {uid}")
              # Actualizar en Firestore
        if firestore_data:
            # Obtener el documento actual para preservar datos no actualizados
            current_doc = db.collection("usuarios").document(uid).get()
            current_data = current_doc.to_dict() if current_doc.exists else {}
            # Combinar datos actuales con nuevos datos
            updated_data = {**current_data, **firestore_data}
            db.collection("usuarios").document(uid).set(updated_data, merge=True)
            logger.info(f"Updated Firestore for user {uid}")
        
        logger.info(f"Profile with password update successful for user {uid}")
        
        # Obtener los datos actualizados para retornar al frontend
        updated_doc = db.collection("usuarios").document(uid).get()
        updated_user_data = updated_doc.to_dict() if updated_doc.exists else {}
        
        return {"message": "Perfil y contraseña actualizados con éxito", "data": updated_user_data}
        
    except HTTPException as he:
        logger.error(f"HTTP Exception in update_profile_with_password: {he.detail}")
        raise he
    except auth.UserNotFoundError:
        logger.error(f"User not found: {uid}")
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except Exception as e:
        logger.error(f"Error al actualizar perfil con contraseña: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        raise HTTPException(status_code=400, detail="Error al actualizar el perfil")

@router.delete("/delete-account")
async def delete_account(account_data: DeleteAccount):
    try:
        # Verificar que el usuario existe
        try:
            user = auth.get_user(account_data.uid)
            # Verificar que el email coincide
            if user.email != account_data.email:
                raise HTTPException(
                    status_code=400,
                    detail="Los datos del usuario no coinciden"
                )
        except auth.UserNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )
        except Exception as e:
            logger.error(f"Error al verificar usuario: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error al verificar el usuario"
            )

        # Eliminar usuario de Firebase Auth
        auth.delete_user(account_data.uid)
        
        # Eliminar datos del usuario de Firestore
        user_ref = db.collection("usuarios").document(account_data.uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=404,
                detail="No se encontraron los datos del usuario"
            )
            
        user_ref.delete()
        
        # Eliminar artículos y productos asociados
        articles_ref = db.collection("articulos")
        articles = articles_ref.where("email", "==", account_data.email).stream()
        for article in articles:
            article.reference.delete()
            
        products_ref = db.collection("productos")
        products = products_ref.where("email", "==", account_data.email).stream()
        for product in products:
            product.reference.delete()
        
        return {"message": "Cuenta eliminada con éxito"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al eliminar cuenta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar la cuenta"
        )

@router.post("/follow/{uid}")
async def follow_user(uid: str, body: FollowRequest):
    current_user_uid = body.current_user_uid
    try:
        # Verificar que el usuario a seguir existe
        user_to_follow = db.collection("usuarios").document(uid).get()
        if not user_to_follow.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        # Verificar que el usuario actual existe
        current_user = db.collection("usuarios").document(current_user_uid).get()
        if not current_user.exists:
            raise HTTPException(status_code=404, detail="Usuario actual no encontrado")
        # Actualizar seguidores del usuario a seguir
        user_to_follow_data = user_to_follow.to_dict()
        if "seguidores" not in user_to_follow_data:
            user_to_follow_data["seguidores"] = []
        if current_user_uid not in user_to_follow_data["seguidores"]:
            user_to_follow_data["seguidores"].append(current_user_uid)
            db.collection("usuarios").document(uid).update({"seguidores": user_to_follow_data["seguidores"]})
        # Actualizar seguidos del usuario actual
        current_user_data = current_user.to_dict()
        if "seguidos" not in current_user_data:
            current_user_data["seguidos"] = []
        if uid not in current_user_data["seguidos"]:
            current_user_data["seguidos"].append(uid)
            db.collection("usuarios").document(current_user_uid).update({"seguidos": current_user_data["seguidos"]})
        return {"message": "Usuario seguido con éxito"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/unfollow/{uid}")
async def unfollow_user(uid: str, body: FollowRequest):
    current_user_uid = body.current_user_uid
    try:
        # Verificar que el usuario a dejar de seguir existe
        user_to_unfollow = db.collection("usuarios").document(uid).get()
        if not user_to_unfollow.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        # Verificar que el usuario actual existe
        current_user = db.collection("usuarios").document(current_user_uid).get()
        if not current_user.exists:
            raise HTTPException(status_code=404, detail="Usuario actual no encontrado")
        # Actualizar seguidores del usuario a dejar de seguir
        user_to_unfollow_data = user_to_unfollow.to_dict()
        if "seguidores" in user_to_unfollow_data and current_user_uid in user_to_unfollow_data["seguidores"]:
            user_to_unfollow_data["seguidores"].remove(current_user_uid)
            db.collection("usuarios").document(uid).update({"seguidores": user_to_unfollow_data["seguidores"]})
        # Actualizar seguidos del usuario actual
        current_user_data = current_user.to_dict()
        if "seguidos" in current_user_data and uid in current_user_data["seguidos"]:
            current_user_data["seguidos"].remove(uid)
            db.collection("usuarios").document(current_user_uid).update({"seguidos": current_user_data["seguidos"]})
        return {"message": "Dejado de seguir al usuario con éxito"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/followers/{uid}")
async def get_followers(uid: str):
    try:
        user = db.collection("usuarios").document(uid).get()
        if not user.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        user_data = user.to_dict()
        followers = user_data.get("seguidores", [])
        
        # Obtener información detallada de los seguidores
        followers_data = []
        for follower_uid in followers:
            follower = db.collection("usuarios").document(follower_uid).get()
            if follower.exists:
                follower_data = follower.to_dict()
                followers_data.append({
                    "uid": follower_uid,
                    "nombre": follower_data.get("nombre", ""),
                    "email": follower_data.get("email", ""),
                    "foto": follower_data.get("foto", None)
                })
        
        return followers_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/following/{uid}")
async def get_following(uid: str):
    try:
        user = db.collection("usuarios").document(uid).get()
        if not user.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        user_data = user.to_dict()
        following = user_data.get("seguidos", [])
        
        # Obtener información detallada de los usuarios seguidos
        following_data = []
        for following_uid in following:
            following_user = db.collection("usuarios").document(following_uid).get()
            if following_user.exists:
                following_user_data = following_user.to_dict()
                following_data.append({
                    "uid": following_uid,
                    "nombre": following_user_data.get("nombre", ""),
                    "email": following_user_data.get("email", ""),
                    "foto": following_user_data.get("foto", None)
                })
        
        return following_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/remove-follower/{uid}")
async def remove_follower(uid: str, body: FollowRequest):
    follower_uid = body.current_user_uid
    try:
        # Eliminar follower_uid de la lista de seguidores de uid
        user_doc = db.collection("usuarios").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user_data = user_doc.to_dict()
        seguidores = user_data.get("seguidores", [])
        if follower_uid in seguidores:
            seguidores.remove(follower_uid)
            db.collection("usuarios").document(uid).update({"seguidores": seguidores})
        # Eliminar uid de la lista de seguidos del follower
        follower_doc = db.collection("usuarios").document(follower_uid).get()
        if follower_doc.exists:
            follower_data = follower_doc.to_dict()
            seguidos = follower_data.get("seguidos", [])
            if uid in seguidos:
                seguidos.remove(uid)
                db.collection("usuarios").document(follower_uid).update({"seguidos": seguidos})
        return {"message": "Seguidor eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def get_current_uid_ws(websocket: WebSocket):
    # Intentar obtener el token de los headers primero
    token = websocket.headers.get('authorization')
    
    # Si no está en los headers, esperar el primer mensaje
    if not token or not token.startswith('Bearer '):
        try:
            # Aceptar la conexión WebSocket primero
            await websocket.accept()
            # Esperar el primer mensaje que debe contener el token
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get('event') == 'auth':
                token = msg.get('token')
            else:
                raise Exception('Token de autenticación no proporcionado')
        except Exception as e:
            raise Exception('Token de autenticación no proporcionado')
    else:
        token = token.replace('Bearer ', '')
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise Exception('Token inválido o expirado') 