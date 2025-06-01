from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from firebase_config import db
from middleware import get_current_uid

router = APIRouter()

class DirectMessage(BaseModel):
    content: str
    type: str = "text"

class DirectChatCreate(BaseModel):
    participant_id: str

@router.post("/direct-chats")
async def create_direct_chat(chat: DirectChatCreate, uid: str = Depends(get_current_uid)):
    # Verificar que el participante existe
    participant = db.collection("usuarios").document(chat.participant_id).get()
    if not participant.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Ordenar los UIDs para la clave única
    participants = sorted([uid, chat.participant_id])
    participants_key = f"{participants[0]}_{participants[1]}"
    
    # Verificar que no existe ya un chat entre estos usuarios
    existing_chat = db.collection("direct_chats").where(
        "participants_key", "==", participants_key
    ).limit(1).get()
    
    if existing_chat:
        return existing_chat[0].to_dict()
    
    # Crear nuevo chat
    chat_data = {
        "participants": participants,
        "participants_key": participants_key,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_message": None
    }
    
    chat_ref = db.collection("direct_chats").document()
    chat_ref.set(chat_data)
    
    return {**chat_data, "id": chat_ref.id}

@router.get("/direct-chats")
async def get_user_chats(uid: str = Depends(get_current_uid)):
    chats = db.collection("direct_chats").where(
        "participants", "array_contains", uid
    ).order_by("updated_at", direction="DESCENDING").stream()
    
    return [{"id": chat.id, **chat.to_dict()} for chat in chats]

@router.post("/direct-chats/{chat_id}/messages")
async def send_message(chat_id: str, message: DirectMessage, uid: str = Depends(get_current_uid)):
    # Verificar que el chat existe y el usuario es participante
    chat = db.collection("direct_chats").document(chat_id).get()
    if not chat.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    
    chat_data = chat.to_dict()
    if uid not in chat_data["participants"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    
    # Crear mensaje
    message_data = {
        "chat_id": chat_id,
        "sender": uid,
        "content": message.content,
        "type": message.type,
        "timestamp": datetime.utcnow(),
        "read_by": [uid]
    }
    
    message_ref = db.collection("direct_messages").document()
    message_ref.set(message_data)
    
    # Actualizar último mensaje del chat
    db.collection("direct_chats").document(chat_id).update({
        "last_message": {
            "content": message.content,
            "sender": uid,
            "timestamp": message_data["timestamp"]
        },
        "updated_at": message_data["timestamp"]
    })
    
    return {**message_data, "id": message_ref.id}

@router.get("/direct-chats/{chat_id}/messages")
async def get_chat_messages(chat_id: str, uid: str = Depends(get_current_uid)):
    # Verificar que el chat existe y el usuario es participante
    chat = db.collection("direct_chats").document(chat_id).get()
    if not chat.exists:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    
    chat_data = chat.to_dict()
    if uid not in chat_data["participants"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este chat")
    
    # Obtener mensajes
    messages = db.collection("direct_messages").where(
        "chat_id", "==", chat_id
    ).order_by("timestamp", direction="DESCENDING").limit(50).stream()
    
    return [{"id": msg.id, **msg.to_dict()} for msg in messages] 