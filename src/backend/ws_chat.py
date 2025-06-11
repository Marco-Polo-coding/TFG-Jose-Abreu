from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
from collections import defaultdict
from auth import get_current_uid_ws
from chat_routes import send_message as save_message_rest, mark_chat_as_read
from firebase_config import db
import json
import asyncio
import datetime

router = APIRouter()

# Estructura: chat_id -> set(conexiones WebSocket)
active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
# Estructura: chat_id -> {uid: {"name": user_name, "timestamp": datetime}}
typing_users: Dict[str, Dict[str, Dict]] = defaultdict(dict)

async def get_user_name(uid: str) -> str:
    """Obtener el nombre del usuario desde Firestore"""
    try:
        user_doc = db.collection("usuarios").document(uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return user_data.get("nombre", user_data.get("email", uid))
        return uid
    except Exception:
        return uid

async def broadcast(chat_id: str, data: dict, exclude_uid: str = None):
    # Si el evento es de mensaje, convierte el timestamp a string ISO
    if data.get('event') == 'message' and 'message' in data:
        msg = data['message']
        if isinstance(msg.get('timestamp'), datetime.datetime):
            msg['timestamp'] = msg['timestamp'].isoformat()
    
    for ws in active_connections[chat_id]:
        try:
            # Si es un evento de typing y el usuario está excluido, no enviar
            if data.get('event') == 'typing' and exclude_uid and data.get('user_uid') == exclude_uid:
                continue
            await ws.send_text(json.dumps(data))
        except Exception:
            pass

@router.websocket("/ws/direct-chats/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str, uid: str = Depends(get_current_uid_ws)):
    active_connections[chat_id].append(websocket)
    
    # Iniciar tarea de limpieza si no está corriendo
    global cleanup_task
    if cleanup_task is None:
        try:
            loop = asyncio.get_running_loop()
            cleanup_task = loop.create_task(cleanup_typing_users())
        except Exception:
            pass
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except Exception:
                continue
            event = msg.get("event")
            if event == "message":
                content = msg.get("content", "")
                if not content:
                    continue
                # Guardar en Firestore y obtener el mensaje guardado
                message_obj = await save_message_rest(chat_id, type("DirectMessage", (), {"content": content, "type": "text"})(), uid)
                await broadcast(chat_id, {"event": "message", "message": message_obj})
            elif event == "typing":
                # Obtener el nombre del usuario y almacenar con timestamp
                user_name = await get_user_name(uid)
                typing_users[chat_id][uid] = {
                    "name": user_name,
                    "timestamp": datetime.datetime.utcnow()
                }
                await broadcast(chat_id, {
                    "event": "typing", 
                    "user_uid": uid, 
                    "user_name": user_name, 
                    "typing": True
                }, exclude_uid=uid)
            elif event == "stop_typing":
                if uid in typing_users[chat_id]:
                    user_name = typing_users[chat_id][uid]["name"]
                    del typing_users[chat_id][uid]
                    await broadcast(chat_id, {
                        "event": "typing", 
                        "user_uid": uid, 
                        "user_name": user_name, 
                        "typing": False
                    }, exclude_uid=uid)
            elif event == "read":
                await mark_chat_as_read(chat_id, uid)
                await broadcast(chat_id, {"event": "read", "user": uid, "chat_id": chat_id})
    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)
        # Limpiar typing del usuario desconectado
        if uid in typing_users[chat_id]:
            user_name = typing_users[chat_id][uid]["name"]
            del typing_users[chat_id][uid]
            await broadcast(chat_id, {
                "event": "typing", 
                "user_uid": uid, 
                "user_name": user_name, 
                "typing": False
            })
        if not active_connections[chat_id]:
            del active_connections[chat_id]
            if chat_id in typing_users:
                del typing_users[chat_id]

# Función para limpiar usuarios que han dejado de escribir (timeout de 3 segundos)
async def cleanup_typing_users():
    while True:
        current_time = datetime.datetime.utcnow()
        for chat_id in list(typing_users.keys()):
            for uid in list(typing_users[chat_id].keys()):
                user_data = typing_users[chat_id][uid]
                time_diff = current_time - user_data["timestamp"]
                if time_diff.total_seconds() > 3:  # Timeout de 3 segundos
                    user_name = user_data["name"]
                    del typing_users[chat_id][uid]
                    await broadcast(chat_id, {
                        "event": "typing", 
                        "user_uid": uid, 
                        "user_name": user_name, 
                        "typing": False
                    })
        await asyncio.sleep(1)  # Revisar cada segundo

# Variable para la tarea de limpieza
cleanup_task = None

def start_cleanup_task():
    global cleanup_task
    if cleanup_task is None:
        try:
            loop = asyncio.get_running_loop()
            cleanup_task = loop.create_task(cleanup_typing_users())
        except RuntimeError:
            # No hay un loop corriendo, se iniciará cuando se use FastAPI
            pass

# Iniciar la tarea cuando se importe en el contexto de FastAPI
start_cleanup_task()