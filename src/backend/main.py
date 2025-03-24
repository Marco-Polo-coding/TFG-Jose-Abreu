from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import db
from firebase_admin import firestore
from typing import List, Dict, Any
from datetime import datetime


app = FastAPI(title="API de la Aplicación")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API"}

# Endpoint para obtener productos
@app.get("/productos", response_model=List[Dict[str, Any]])
async def obtener_productos():
    try:
        productos_ref = db.collection("productos")
        productos = productos_ref.stream()
        return [{"id": producto.id, **producto.to_dict()} for producto in productos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener artículos
@app.get("/articulos", response_model=List[Dict[str, Any]])
async def get_articulos():
    articulos_ref = db.collection("articulos").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in articulos_ref]

# Endpoint para obtener comentarios de un artículo
@app.get("/articulos/{articulo_id}/comentarios", response_model=List[Dict[str, Any]])
async def get_comentarios(articulo_id: str):
    comentarios_ref = db.collection("articulos").document(articulo_id).collection("comentarios").stream()
    return [{"id": c.id, **c.to_dict()} for c in comentarios_ref]

# Endpoint para simular compra (mock)
@app.post("/comprar")
async def comprar(producto_id: str, usuario_id: str):
    compra = {
        "usuario": usuario_id,
        "producto": producto_id,
        "fecha": firestore.SERVER_TIMESTAMP
    }
    db.collection("compras").add(compra)
    return {"mensaje": f"Compra registrada de {producto_id} por {usuario_id}"}

# 2. GET /usuarios → Devuelve todos los usuarios
@app.get("/usuarios", response_model=List[Dict[str, Any]])
async def obtener_usuarios():
    try:
        usuarios_ref = db.collection("usuarios")
        usuarios = usuarios_ref.stream()
        return [{"id": usuario.id, **usuario.to_dict()} for usuario in usuarios]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. GET /articulos/{id} → Devuelve un artículo por ID
@app.get("/articulos/{articulo_id}", response_model=Dict[str, Any])
async def obtener_articulo(articulo_id: str):
    try:
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        return {"id": articulo.id, **articulo.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. POST /articulos/{id}/comentarios → Añadir comentario a un artículo
@app.post("/articulos/{articulo_id}/comentarios", response_model=Dict[str, Any])
async def agregar_comentario(articulo_id: str, comentario: Dict[str, Any]):
    try:
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        # Crear el comentario con timestamp
        comentario["timestamp"] = datetime.now()
        comentario_id = articulo_ref.collection("comentarios").document().id
        
        # Guardar el comentario
        articulo_ref.collection("comentarios").document(comentario_id).set(comentario)
        
        return {"id": comentario_id, **comentario}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. POST /articulos/{id}/comentarios/{comentario_id}/respuestas → Añadir respuesta a un comentario
@app.post("/articulos/{articulo_id}/comentarios/{comentario_id}/respuestas", response_model=Dict[str, Any])
async def agregar_respuesta(articulo_id: str, comentario_id: str, respuesta: Dict[str, Any]):
    try:
        comentario_ref = db.collection("articulos").document(articulo_id).collection("comentarios").document(comentario_id)
        comentario = comentario_ref.get()
        if not comentario.exists:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        
        # Crear la respuesta con timestamp
        respuesta["timestamp"] = datetime.now()
        respuesta_id = comentario_ref.collection("respuestas").document().id
        
        # Guardar la respuesta
        comentario_ref.collection("respuestas").document(respuesta_id).set(respuesta)
        
        return {"id": respuesta_id, **respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
