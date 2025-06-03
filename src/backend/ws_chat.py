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
    print(f'BACKEND: Enviando evento a {len(active_connections[chat_id])} clientes:', data)  # LOG
    for ws in active_connections[chat_id]:
        try:
            # Si es un evento de typing y el usuario está excluido, no enviar
            if data.get('event') == 'typing' and exclude_uid and data.get('user') == exclude_uid:
                continue
            print(f'BACKEND: Enviando por WS a cliente: {ws}')  # LOG
            await ws.send_text(json.dumps(data))
        except Exception as e:
            print('BACKEND: Error enviando por WS:', e)  # LOG

@router.websocket("/ws/direct-chats/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str, uid: str = Depends(get_current_uid_ws)):
    print(f'BACKEND: Nueva conexión WS para chat {chat_id}, usuario {uid}')  # LOG
    active_connections[chat_id].append(websocket)
    print(f'BACKEND: Total conexiones activas para chat {chat_id}: {len(active_connections[chat_id])}')  # LOG
    try:
        while True:
            data = await websocket.receive_text()
            print('BACKEND: Mensaje recibido en WS:', data)  # LOG
            try:
                msg = json.loads(data)
            except Exception as e:
                print('BACKEND: Error al parsear mensaje:', e)  # LOG
                continue
            event = msg.get("event")
            if event == "message":
                content = msg.get("content", "")
                print('BACKEND: Guardando mensaje en Firestore:', content)  # LOG
                if not content:
                    continue
                # Guardar en Firestore y obtener el mensaje guardado
                message_obj = await save_message_rest(chat_id, type("DirectMessage", (), {"content": content, "type": "text"})(), uid)
                print('BACKEND: Enviando mensaje a clientes WS:', message_obj)  # LOG
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
        print(f'BACKEND: Desconexión WS para chat {chat_id}, usuario {uid}')  # LOG
        active_connections[chat_id].remove(websocket)
        typing_users[chat_id].discard(uid)
        await broadcast(chat_id, {"event": "typing", "user": uid, "typing": False})
        if not active_connections[chat_id]:
            print(f'BACKEND: No quedan conexiones activas para chat {chat_id}, limpiando...')  # LOG
            del active_connections[chat_id]
            if chat_id in typing_users:
                del typing_users[chat_id] 