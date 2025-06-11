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
# Estructura: chat_id -> set(uids escribiendo)
typing_users: Dict[str, set] = defaultdict(set)

async def broadcast(chat_id: str, data: dict, exclude_uid: str = None):
    # Si el evento es de mensaje, convierte el timestamp a string ISO
    if data.get('event') == 'message' and 'message' in data:
        msg = data['message']
        if isinstance(msg.get('timestamp'), datetime.datetime):
            msg['timestamp'] = msg['timestamp'].isoformat()
    for ws in active_connections[chat_id]:
        try:
            # Si es un evento de typing y el usuario está excluido, no enviar
            if data.get('event') == 'typing' and exclude_uid and data.get('user') == exclude_uid:
                continue
            await ws.send_text(json.dumps(data))
        except Exception:
            pass

@router.websocket("/ws/direct-chats/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str, uid: str = Depends(get_current_uid_ws)):
    active_connections[chat_id].append(websocket)
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
                typing_users[chat_id].add(uid)
                await broadcast(chat_id, {"event": "typing", "user": uid, "typing": True}, exclude_uid=uid)
            elif event == "stop_typing":
                typing_users[chat_id].discard(uid)
                await broadcast(chat_id, {"event": "typing", "user": uid, "typing": False}, exclude_uid=uid)
            elif event == "read":
                await mark_chat_as_read(chat_id, uid)
                await broadcast(chat_id, {"event": "read", "user": uid, "chat_id": chat_id})
    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)
        typing_users[chat_id].discard(uid)
        await broadcast(chat_id, {"event": "typing", "user": uid, "typing": False})
        if not active_connections[chat_id]:
            del active_connections[chat_id]
            if chat_id in typing_users:
                del typing_users[chat_id]