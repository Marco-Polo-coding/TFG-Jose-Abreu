from fastapi import APIRouter, HTTPException, Depends, Body, Header
from pydantic import BaseModel, Field
from typing import List, Optional
from firebase_config import db
from datetime import datetime
from uuid import uuid4
from firebase_admin import auth
from middleware import get_token_header

router = APIRouter()

# Modelos
class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatCreate(BaseModel):
    name: Optional[str] = None
    messages: Optional[List[Message]] = []

class ChatRename(BaseModel):
    name: str

class ChatMigrate(BaseModel):
    chats: List[dict]  # Recibe la estructura completa de los chats desde localStorage

# Utilidad para obtener el UID del usuario autenticado desde el token
async def get_current_uid(token: str = Depends(get_token_header)):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

# 1. Crear un nuevo chat
@router.post("/chats")
async def create_chat(chat: ChatCreate = Body(...), uid: str = Depends(get_current_uid)):
    now = datetime.utcnow().isoformat()
    chat_id = str(uuid4())
    name = chat.name or f"Chat {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    chat_doc = {
        "id": chat_id,
        "user": uid,
        "name": name,
        "created_at": now,
        "updated_at": now,
        "messages": [m.dict() for m in chat.messages] if chat.messages else []
    }
    db.collection("chats").document(chat_id).set(chat_doc)
    return chat_doc

# 2. Obtener todos los chats del usuario
@router.get("/chats")
async def get_chats(uid: str = Depends(get_current_uid)):
    chats_ref = db.collection("chats").where("user", "==", uid).order_by("updated_at", direction="DESCENDING").stream()
    chats = [c.to_dict() for c in chats_ref]
    return chats

# 3. Obtener los mensajes de un chat
@router.get("/chats/{chat_id}")
async def get_chat(chat_id: str, uid: str = Depends(get_current_uid)):
    doc = db.collection("chats").document(chat_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    chat = doc.to_dict()
    if chat.get("user") != uid:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    return chat

# 4. Añadir mensaje a un chat
@router.post("/chats/{chat_id}/messages")
async def add_message(chat_id: str, message: Message = Body(...), uid: str = Depends(get_current_uid)):
    doc_ref = db.collection("chats").document(chat_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    chat = doc.to_dict()
    if chat.get("user") != uid:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    messages = chat.get("messages", [])
    msg = message.dict()
    if not msg.get("timestamp"):
        msg["timestamp"] = datetime.utcnow().isoformat()
    messages.append(msg)
    doc_ref.update({
        "messages": messages,
        "updated_at": datetime.utcnow().isoformat()
    })
    return {"success": True}

# 5. Renombrar un chat
@router.patch("/chats/{chat_id}")
async def rename_chat(chat_id: str, data: ChatRename, uid: str = Depends(get_current_uid)):
    doc_ref = db.collection("chats").document(chat_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    chat = doc.to_dict()
    if chat.get("user") != uid:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    doc_ref.update({
        "name": data.name,
        "updated_at": datetime.utcnow().isoformat()
    })
    return {"success": True}

# 6. Eliminar un chat
@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, uid: str = Depends(get_current_uid)):
    doc_ref = db.collection("chats").document(chat_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    chat = doc.to_dict()
    if chat.get("user") != uid:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    doc_ref.delete()
    return {"success": True}

# 7. Migrar chats desde localStorage
@router.post("/chats/migrate")
async def migrate_chats(data: ChatMigrate = Body(...), uid: str = Depends(get_current_uid)):
    now = datetime.utcnow().isoformat()
    migrated = []
    for chat in data.chats:
        chat_id = str(uuid4())
        name = chat.get("name") or f"Chat {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        chat_doc = {
            "id": chat_id,
            "user": uid,
            "name": name,
            "created_at": chat.get("created_at", now),
            "updated_at": now,
            "messages": chat.get("messages", [])
        }
        db.collection("chats").document(chat_id).set(chat_doc)
        migrated.append(chat_doc)
    return {"migrated": migrated} 