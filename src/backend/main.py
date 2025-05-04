from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import db
from auth import router as auth_router
from firebase_admin import firestore
from typing import List, Dict, Any
from datetime import datetime

app = FastAPI(title="API de la Aplicación")

# Incluir el router de autenticación
app.include_router(auth_router, prefix="/auth") 

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

# ✅ Endpoint para obtener productos
@app.get("/productos", response_model=List[Dict[str, Any]])
async def obtener_productos():
    try:
        productos_ref = db.collection("productos")
        productos = productos_ref.stream()
        return [{"id": producto.id, **producto.to_dict()} for producto in productos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para obtener productos de un usuario específico
@app.get("/usuarios/{usuario_id}/productos", response_model=List[Dict[str, Any]])
async def obtener_productos_usuario(usuario_id: str):
    try:
        productos_ref = db.collection("productos").where("usuario", "==", usuario_id)
        productos = productos_ref.stream()
        return [{"id": producto.id, **producto.to_dict()} for producto in productos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para obtener un producto por ID
@app.get("/productos/{producto_id}", response_model=Dict[str, Any])
async def obtener_producto_por_id(producto_id: str):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"id": producto.id, **producto.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para crear un producto
@app.post("/productos", response_model=Dict[str, Any])
async def crear_producto(producto: Dict[str, Any]):
    try:
        producto_ref = db.collection("productos").document()
        producto["id"] = producto_ref.id
        producto_ref.set(producto)
        return {"id": producto_ref.id, **producto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para actualizar un producto
@app.put("/productos/{producto_id}", response_model=Dict[str, Any])
async def actualizar_producto(producto_id: str, producto: Dict[str, Any]):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        if not producto_ref.get().exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto_ref.update(producto)
        return {"id": producto_id, **producto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para eliminar un producto
@app.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        if not producto_ref.get().exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        producto_ref.delete()
        return {"message": "Producto eliminado con éxito"}
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

# GET /usuarios → Devuelve todos los usuarios
@app.get("/usuarios", response_model=List[Dict[str, Any]])
async def obtener_usuarios():
    try:
        usuarios_ref = db.collection("usuarios")
        usuarios = usuarios_ref.stream()
        return [{"id": usuario.id, **usuario.to_dict()} for usuario in usuarios]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET /articulos/{id} → Devuelve un artículo por ID
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

# POST /articulos/{id}/comentarios → Añadir comentario a un artículo
@app.post("/articulos/{articulo_id}/comentarios", response_model=Dict[str, Any])
async def agregar_comentario(articulo_id: str, comentario: Dict[str, Any]):
    try:
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        comentario["timestamp"] = datetime.now()
        comentario_id = articulo_ref.collection("comentarios").document().id
        articulo_ref.collection("comentarios").document(comentario_id).set(comentario)
        
        return {"id": comentario_id, **comentario}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# POST /articulos/{id}/comentarios/{comentario_id}/respuestas → Añadir respuesta a un comentario
@app.post("/articulos/{articulo_id}/comentarios/{comentario_id}/respuestas", response_model=Dict[str, Any])
async def agregar_respuesta(articulo_id: str, comentario_id: str, respuesta: Dict[str, Any]):
    try:
        comentario_ref = db.collection("articulos").document(articulo_id).collection("comentarios").document(comentario_id)
        comentario = comentario_ref.get()
        if not comentario.exists:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        
        respuesta["timestamp"] = datetime.now()
        respuesta_id = comentario_ref.collection("respuestas").document().id
        comentario_ref.collection("respuestas").document(respuesta_id).set(respuesta)
        
        return {"id": respuesta_id, **respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ NUEVO: Endpoint para crear un artículo
@app.post("/articulos", response_model=Dict[str, Any])
async def crear_articulo(articulo: Dict[str, Any]):
    try:
        articulo_ref = db.collection("articulos").document()
        articulo["id"] = articulo_ref.id
        articulo_ref.set(articulo)
        return {"id": articulo_ref.id, **articulo}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
