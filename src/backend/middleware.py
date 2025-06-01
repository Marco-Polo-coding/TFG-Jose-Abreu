from fastapi import HTTPException, Depends, Header
from firebase_admin import auth
from firebase_config import db

async def get_token_header(Authorization: str = Header(...)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    return Authorization.split("Bearer ")[-1]

async def verify_admin(token: str = Depends(get_token_header)):
    try:
        # Verificar el token de Firebase
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Obtener el usuario de Firestore
        user_doc = db.collection("usuarios").document(uid).get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=401,
                detail="Usuario no encontrado"
            )
            
        user_data = user_doc.to_dict()
        
        # Verificar si el usuario es administrador
        if user_data.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos de administrador"
            )
            
        return user_data
        
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )

async def get_current_uid(token: str = Depends(get_token_header)):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado") 