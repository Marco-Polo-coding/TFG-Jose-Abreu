from fastapi import FastAPI, HTTPException, Body, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form, File, UploadFile
from firebase_config import db
from auth import router as auth_router
from admin import router as admin_router
from firebase_admin import firestore, auth
from typing import List, Dict, Any, Optional
from datetime import datetime
from cloudinary_config import *  # Importar la configuración
import cloudinary.uploader
from pydantic import BaseModel
import logging
import json
from chat_history import router as chat_history_router
from chat import router as chat_router
from chat_routes import router as direct_chat_router
from ws_chat import router as ws_chat_router

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Función para sanitizar datos sensibles en logs
def sanitize_log_data(data):
    if isinstance(data, dict):
        return {k: '***' if k in ['password', 'token', 'api_key'] else v for k, v in data.items()}
    return data

app = FastAPI(title="API de la Aplicación")

# Incluir el router de autenticación
app.include_router(auth_router, prefix="/auth")

# Incluir el router de administrador
app.include_router(admin_router, prefix="/admin")

# Incluir el router de chat history
app.include_router(chat_history_router)

# Incluir el router de chat
app.include_router(chat_router)

# Incluir el router de direct chat
app.include_router(direct_chat_router)

# Incluir el router WebSocket de chat directo
app.include_router(ws_chat_router)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",  # Frontend Astro (puerto original)
        "http://localhost:4322",  # Frontend Astro (puerto alternativo)
        "http://localhost:4323",  # Frontend Astro (puerto alternativo 2)
        "http://localhost:8000",  # Backend FastAPI
        "http://127.0.0.1:4321",  # Frontend alternativa
        "http://127.0.0.1:4322",  # Frontend alternativa
        "http://127.0.0.1:4323",  # Frontend alternativa 2
        "http://127.0.0.1:8000"   # Backend alternativa
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para estadísticas mensuales
class EstadisticasMensuales(BaseModel):
    fecha: str
    total_usuarios: int
    total_productos: int
    total_articulos: int
    total_compras: int

@app.post("/admin/estadisticas-mensuales")
async def guardar_estadisticas_mensuales():
    try:
        # Obtener totales actuales
        usuarios = len(list(db.collection("usuarios").stream()))
        productos = len(list(db.collection("productos").stream()))
        articulos = len(list(db.collection("articulos").stream()))
        compras = len(list(db.collection("compras").stream()))
        
        # Crear documento con estadísticas
        fecha_actual = datetime.now().strftime("%Y-%m")
        estadisticas = {
            "fecha": fecha_actual,
            "total_usuarios": usuarios,
            "total_productos": productos,
            "total_articulos": articulos,
            "total_compras": compras,
            "fecha_creacion": datetime.now().isoformat()
        }
        
        # Guardar en Firestore
        db.collection("estadisticas_mensuales").document(fecha_actual).set(estadisticas)
        
        return {"message": "Estadísticas guardadas correctamente", "estadisticas": estadisticas}
    except Exception as e:
        logger.error(f"Error al guardar estadísticas mensuales: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/estadisticas-mensuales", response_model=List[EstadisticasMensuales])
async def obtener_estadisticas_mensuales():
    try:
        # Obtener todas las estadísticas ordenadas por fecha
        stats_ref = db.collection("estadisticas_mensuales").order_by("fecha", direction=firestore.Query.DESCENDING)
        stats = stats_ref.stream()
        
        return [{"fecha": doc.id, **doc.to_dict()} for doc in stats]
    except Exception as e:
        logger.error(f"Error al obtener estadísticas mensuales: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API"}

# ✅ Endpoint para obtener productos
@app.get("/productos", response_model=List[Dict[str, Any]])
async def get_productos():
    productos_ref = db.collection("productos").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in productos_ref]

@app.get("/productos/{producto_id}", response_model=Dict[str, Any])
async def obtener_producto(producto_id: str):
    try:
        logger.info(f"Búsqueda de producto: {producto_id}")
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"id": producto.id, **producto.to_dict()}
    except Exception as e:
        logger.error(f"Error al obtener producto {producto_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ha ocurrido un error al obtener el producto. Por favor, inténtalo de nuevo más tarde."
        )

@app.post("/productos", response_model=Dict[str, Any])
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria: str = Form(...),
    estado: str = Form(...),
    imagenes: List[UploadFile] = File(None),
    usuario_email: Optional[str] = Form(None)
):
    try:
        logger.info(f"Intento de creación de producto: {sanitize_log_data({'nombre': nombre, 'categoria': categoria, 'usuario': usuario_email})}")
        urls_imagenes = []
        if imagenes:
            for imagen in imagenes:
                try:
                    if hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
                        contents = await imagen.read()
                        result = cloudinary.uploader.upload(
                            contents,
                            folder="product_images",
                            resource_type="auto"                        )
                        urls_imagenes.append(result["secure_url"])
                except Exception as img_err:
                    continue

        # Si no se subió ninguna imagen, usar la imagen por defecto
        if not urls_imagenes:
            urls_imagenes = ["https://cataas.com/cat"]

        producto_ref = db.collection("productos").document()
        producto = {
            "id": producto_ref.id,
            "nombre": nombre,
            "descripcion": descripcion,
            "precio": precio,
            "stock": stock,
            "categoria": categoria,
            "estado": estado,
            "imagenes": urls_imagenes,
            "fecha_creacion": datetime.now().isoformat()
        }
        if usuario_email:
            producto["usuario_email"] = usuario_email
        producto_ref.set(producto)
        return {"id": producto_ref.id, **producto}
    except Exception as e:
        logger.error(f"Error en crear_producto: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ha ocurrido un error al crear el producto. Por favor, inténtalo de nuevo más tarde."
        )

@app.put("/productos/{producto_id}", response_model=Dict[str, Any])
async def actualizar_producto(
    producto_id: str,
    nombre: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    precio: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    categoria: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    imagenes: List[UploadFile] = File(None),
    imagenes_existentes: List[str] = Form(None)
):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        data = {}
        if nombre is not None: data["nombre"] = nombre
        if descripcion is not None: data["descripcion"] = descripcion
        if precio is not None: data["precio"] = precio
        if stock is not None: data["stock"] = stock
        if categoria is not None: data["categoria"] = categoria
        if estado is not None: data["estado"] = estado

        # Manejar imágenes
        urls_imagenes = []
        
        # Si hay imágenes nuevas, procesarlas
        if imagenes:
            for imagen in imagenes:
                if hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
                    contents = await imagen.read()
                    result = cloudinary.uploader.upload(
                        contents,
                        folder="product_images",
                        resource_type="auto"
                    )
                    urls_imagenes.append(result["secure_url"])
        
        # Si hay imágenes existentes, añadirlas
        if imagenes_existentes:
            urls_imagenes.extend(imagenes_existentes)
        
        # Si no hay imágenes nuevas ni existentes, mantener las actuales
        if not urls_imagenes:
            producto_data = producto.to_dict()
            if "imagenes" in producto_data:
                urls_imagenes = producto_data["imagenes"]
            elif "imagen" in producto_data:
                urls_imagenes = [producto_data["imagen"]]
            else:
                urls_imagenes = ["https://cataas.com/cat"]

        data["imagenes"] = urls_imagenes

        if not data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")
        
        producto_ref.update(data)
        producto_actualizado = producto_ref.get().to_dict()
        producto_actualizado["id"] = producto_id
        
        return producto_actualizado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        producto_data = producto.to_dict()
        
        if producto_data.get("imagenes") and "cloudinary.com" in producto_data["imagenes"][0]:
            try:
                for url in producto_data["imagenes"]:
                    url_parts = url.split("/")
                    upload_index = url_parts.index("upload") + 1
                    public_id = "/".join(url_parts[upload_index + 1:]).split(".")[0]
                    result = cloudinary.uploader.destroy(public_id)
            except Exception:
                pass
        
        producto_ref.delete()
        return {"message": "Producto eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Endpoint para obtener productos de un usuario específico
@app.get("/usuarios/{usuario_id}/productos", response_model=List[Dict[str, Any]])
async def obtener_productos_usuario(usuario_id: str):
    try:
        # Buscar el usuario por UID
        user_doc = db.collection("usuarios").document(usuario_id).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user_email = user_doc.to_dict().get("email")
        # Buscar productos por email
        productos_ref = db.collection("productos").where("usuario_email", "==", user_email)
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

# Endpoint para obtener artículos
@app.get("/articulos", response_model=List[Dict[str, Any]])
async def get_articulos():
    articulos_ref = db.collection("articulos").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in articulos_ref]

# Endpoint para obtener comentarios de un artículo
@app.get("/articulos/{articulo_id}/comentarios", response_model=List[Dict[str, Any]])
async def get_comentarios(articulo_id: str):
    comentarios_ref = db.collection("articulos").document(articulo_id).collection("comentarios").stream()
    comentarios = []
    for c in comentarios_ref:
        comentario_data = c.to_dict()
        comentario_id = c.id
        # Obtener respuestas de este comentario
        respuestas_ref = db.collection("articulos").document(articulo_id).collection("comentarios").document(comentario_id).collection("respuestas").stream()
        respuestas = [{"id": r.id, **r.to_dict()} for r in respuestas_ref]
        comentario_data["id"] = comentario_id
        comentario_data["respuestas"] = respuestas
        comentarios.append(comentario_data)
    return comentarios

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
async def agregar_comentario(
    articulo_id: str,
    usuario: str = Form(...),
    texto: str = Form(...),
    fecha: str = Form(...),
    imagen: Optional[UploadFile] = File(None),
    comentario_padre: Optional[str] = Form(None)
):
    try:
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        comentario_data = {
            "usuario": usuario,
            "texto": texto,
            "fecha": fecha,
            "timestamp": datetime.now()
        }

        # Si hay una imagen, subirla a Cloudinary
        if imagen:
            if not imagen.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
            
            contents = await imagen.read()
            result = cloudinary.uploader.upload(
                contents,
                folder="comment_images",
                resource_type="auto"
            )
            comentario_data["imagen"] = result["secure_url"]

        # Si es una respuesta, añadir el ID del comentario padre
        if comentario_padre:
            comentario_data["comentario_padre"] = comentario_padre
            comentario_ref = articulo_ref.collection("comentarios").document(comentario_padre)
            comentario = comentario_ref.get()
            if not comentario.exists:
                raise HTTPException(status_code=404, detail="Comentario padre no encontrado")
            
            respuesta_id = comentario_ref.collection("respuestas").document().id
            comentario_ref.collection("respuestas").document(respuesta_id).set(comentario_data)
            return {"id": respuesta_id, **comentario_data}
        
        # Si es un comentario nuevo
        comentario_id = articulo_ref.collection("comentarios").document().id
        articulo_ref.collection("comentarios").document(comentario_id).set(comentario_data)
        
        return {"id": comentario_id, **comentario_data}
    except Exception as e:
        logger.error(f"Error al agregar comentario: {str(e)}", exc_info=True)
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
async def crear_articulo(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    contenido: str = Form(...),
    categoria: str = Form(...),
    imagen: Optional[UploadFile] = File(None),
    autor: Optional[str] = Form("Autor"),
    autor_email: Optional[str] = Form("")
):
    try:
        gatito_url = "https://cataas.com/cat"
        url_imagen = gatito_url
        
        if imagen is not None:
            try:
                if hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
                    contents = await imagen.read()
                    result = cloudinary.uploader.upload(
                        contents,
                        folder="blog_images",
                        resource_type="auto"
                    )
                    url_imagen = result["secure_url"]
            except Exception:
                url_imagen = gatito_url

        articulo_ref = db.collection("articulos").document()
        articulo = {
            "id": articulo_ref.id,
            "titulo": titulo,
            "descripcion": descripcion,
            "contenido": contenido,
            "categoria": categoria,
            "imagen": url_imagen,
            "fecha_publicacion": datetime.now().isoformat(),
            "autor": autor,
            "autor_email": autor_email,
            "likes": 0,
        }
        articulo_ref.set(articulo)
        return {"id": articulo_ref.id, **articulo}
    except Exception as e:
        logger.error(f"Error creating article: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Leer el contenido del archivo
        contents = await file.read()
        
        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="blog_images",  # Opcional: organizar imágenes en carpetas
            resource_type="auto"   # Detecta automáticamente el tipo de archivo
        )
        
        # Devolver la URL pública
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

@app.delete("/articulos/{articulo_id}")
async def eliminar_articulo(articulo_id: str):
    try:
        # Obtener el artículo antes de eliminarlo
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        articulo_data = articulo.to_dict()
        print(f"\n[ELIMINACIÓN] Iniciando eliminación del artículo: {articulo_data.get('titulo', 'Sin título')} (ID: {articulo_id})")
        
        # Si el artículo tiene una imagen de Cloudinary, eliminarla
        if articulo_data.get("imagen") and "cloudinary.com" in articulo_data["imagen"]:
            try:
                print(f"[ELIMINACIÓN] Imagen encontrada en Cloudinary: {articulo_data['imagen']}")
                # Extraer el public_id de la URL de Cloudinary
                # La URL de Cloudinary tiene el formato: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
                url_parts = articulo_data["imagen"].split("/")
                # El public_id es la parte después de "upload/" pero sin la versión
                upload_index = url_parts.index("upload") + 1
                # Saltamos la versión (v1234567890) y tomamos el resto
                public_id = "/".join(url_parts[upload_index + 1:]).split(".")[0]  # Eliminar la extensión
                
                print(f"[ELIMINACIÓN] Intentando eliminar imagen con public_id: {public_id}")
                # Eliminar la imagen de Cloudinary
                result = cloudinary.uploader.destroy(public_id)
                print(f"[ELIMINACIÓN] Resultado de eliminación de imagen: {result}")
            except Exception as img_err:
                print(f"[ERROR] Error eliminando imagen de Cloudinary: {str(img_err)}")
                # Continuar con la eliminación del artículo incluso si falla la eliminación de la imagen
        else:
            print("[ELIMINACIÓN] El artículo no tiene imagen en Cloudinary o usa imagen por defecto")
        
        # Eliminar el artículo de la base de datos
        articulo_ref.delete()
        print(f"[ELIMINACIÓN] Artículo eliminado correctamente de la base de datos")
        return {"message": "Artículo eliminado correctamente"}
    except Exception as e:
        print(f"[ERROR] Error en eliminar_articulo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/articulos/{articulo_id}", response_model=Dict[str, Any])
async def actualizar_articulo(
    articulo_id: str,
    titulo: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    contenido: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
    imagen: Optional[UploadFile] = File(None),
    autor: Optional[str] = Form(None),
    autor_email: Optional[str] = Form(None)
):
    try:
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")

        data = {}
        if titulo is not None: data["titulo"] = titulo
        if descripcion is not None: data["descripcion"] = descripcion
        if contenido is not None: data["contenido"] = contenido
        if categoria is not None: data["categoria"] = categoria
        if autor is not None: data["autor"] = autor
        if autor_email is not None: data["autor_email"] = autor_email

        # Si hay imagen nueva, súbela a Cloudinary
        if imagen is not None and hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
            contents = await imagen.read();
            result = cloudinary.uploader.upload(
                contents,
                folder="blog_images",
                resource_type="auto"
            )
            data["imagen"] = result["secure_url"]

        if not data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

        articulo_ref.update(data)
        articulo_actualizado = articulo_ref.get().to_dict()
        articulo_actualizado["id"] = articulo_id
        return articulo_actualizado
    except Exception as e:
        print("Error en actualizar_articulo:", e)
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para guardar un artículo
@app.post("/usuarios/{user_email}/articulos-guardados/{articulo_id}")
async def guardar_articulo(user_email: str, articulo_id: str):
    try:
        # Verificar que el artículo existe
        articulo_ref = db.collection("articulos").document(articulo_id)
        articulo = articulo_ref.get()
        if not articulo.exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")

        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_ref = usuarios[0].reference
        
        # Obtener los artículos guardados actuales
        usuario_data = usuario_ref.get().to_dict()
        articulos_guardados = usuario_data.get("articulos_guardados", [])
        
        # Verificar si el artículo ya está guardado
        if articulo_id in articulos_guardados:
            raise HTTPException(status_code=400, detail="El artículo ya está guardado")
        
        # Añadir el artículo a la lista de guardados
        articulos_guardados.append(articulo_id)
        usuario_ref.update({"articulos_guardados": articulos_guardados})
        
        return {"message": "Artículo guardado correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener artículos guardados de un usuario
@app.get("/usuarios/{user_email}/articulos-guardados")
async def obtener_articulos_guardados(user_email: str):
    try:
        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_data = usuarios[0].to_dict()
        articulos_guardados = usuario_data.get("articulos_guardados", [])
        
        # Obtener los detalles de cada artículo guardado
        articulos = []
        for articulo_id in articulos_guardados:
            articulo_ref = db.collection("articulos").document(articulo_id)
            articulo = articulo_ref.get()
            if articulo.exists:
                articulos.append({"id": articulo.id, **articulo.to_dict()})
        
        return articulos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para eliminar un artículo guardado
@app.delete("/usuarios/{user_email}/articulos-guardados/{articulo_id}")
async def eliminar_articulo_guardado(user_email: str, articulo_id: str):
    try:
        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_ref = usuarios[0].reference
        
        # Obtener los artículos guardados actuales
        usuario_data = usuario_ref.get().to_dict()
        articulos_guardados = usuario_data.get("articulos_guardados", [])
        
        # Verificar si el artículo está guardado
        if articulo_id not in articulos_guardados:
            raise HTTPException(status_code=404, detail="El artículo no está guardado")
        
        # Eliminar el artículo de la lista de guardados
        articulos_guardados.remove(articulo_id)
        usuario_ref.update({"articulos_guardados": articulos_guardados})
        
        return {"message": "Artículo eliminado de guardados correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para guardar un producto como favorito
@app.post("/usuarios/{user_email}/productos-favoritos/{producto_id}")
async def guardar_producto_favorito(user_email: str, producto_id: str):
    try:
        # Verificar que el producto existe
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_ref = usuarios[0].reference
        
        # Obtener los productos favoritos actuales
        usuario_data = usuario_ref.get().to_dict()
        productos_favoritos = usuario_data.get("productos_favoritos", [])
        
        # Verificar si el producto ya está en favoritos
        if producto_id in productos_favoritos:
            raise HTTPException(status_code=400, detail="El producto ya está en favoritos")
        
        # Añadir el producto a la lista de favoritos
        productos_favoritos.append(producto_id)
        usuario_ref.update({"productos_favoritos": productos_favoritos})
        
        return {"message": "Producto añadido a favoritos correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener productos favoritos de un usuario
@app.get("/usuarios/{user_email}/productos-favoritos")
async def obtener_productos_favoritos(user_email: str):
    try:
        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_data = usuarios[0].to_dict()
        productos_favoritos = usuario_data.get("productos_favoritos", [])
        
        # Obtener los detalles de cada producto favorito
        productos = []
        for producto_id in productos_favoritos:
            producto_ref = db.collection("productos").document(producto_id)
            producto = producto_ref.get()
            if producto.exists:
                productos.append({"id": producto.id, **producto.to_dict()})
        
        return productos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para eliminar un producto de favoritos
@app.delete("/usuarios/{user_email}/productos-favoritos/{producto_id}")
async def eliminar_producto_favorito(user_email: str, producto_id: str):
    try:
        # Obtener el usuario
        usuarios_ref = db.collection("usuarios").where("email", "==", user_email).limit(1)
        usuarios = list(usuarios_ref.stream())
        if not usuarios:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_ref = usuarios[0].reference
        
        # Obtener los productos favoritos actuales
        usuario_data = usuario_ref.get().to_dict()
        productos_favoritos = usuario_data.get("productos_favoritos", [])
        
        # Verificar si el producto está en favoritos
        if producto_id not in productos_favoritos:
            raise HTTPException(status_code=404, detail="El producto no está en favoritos")
        
        # Eliminar el producto de la lista de favoritos
        productos_favoritos.remove(producto_id)
        usuario_ref.update({"productos_favoritos": productos_favoritos})
        
        return {"message": "Producto eliminado de favoritos correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MetodoPago(BaseModel):
    tipo: str
    datos: dict

class CompraSinUid(BaseModel):
    productos: list
    total: float
    metodo_pago: dict
    fecha: str

@app.post("/usuarios/{uid}/metodos_pago/{tipo}")
async def guardar_metodo_pago(uid: str, tipo: str, datos: dict = Body(...)):
    try:
        user_ref = db.collection("usuarios").document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        metodos = user_doc.to_dict().get("metodos_pago", {})
        metodos[tipo] = datos
        user_ref.update({"metodos_pago": metodos})
        return {"message": f"Método de pago '{tipo}' guardado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/usuarios/{uid}/metodos_pago/{tipo}")
async def eliminar_metodo_pago(uid: str, tipo: str):
    try:
        user_ref = db.collection("usuarios").document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        metodos = user_doc.to_dict().get("metodos_pago", {})
        if tipo in metodos:
            del metodos[tipo]
            user_ref.update({"metodos_pago": metodos})
            return {"message": f"Método de pago '{tipo}' eliminado correctamente"}
        else:
            raise HTTPException(status_code=404, detail=f"Método de pago '{tipo}' no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/usuarios/{uid}/metodos_pago")
async def obtener_metodos_pago(uid: str):
    try:
        doc = db.collection("usuarios").document(uid).get()
        if doc.exists:
            data = doc.to_dict()
            return data.get("metodos_pago", {})
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_token_header(Authorization: str = Header(...)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    return Authorization.split("Bearer ")[-1]

async def verify_user(token: str = Depends(get_token_header)):
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        return uid
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

@app.post("/compras")
async def guardar_compra(compra: CompraSinUid, uid: str = Depends(verify_user)):
    try:
        compra_dict = compra.dict()
        compra_dict['uid'] = uid
        
        # Obtener el email del usuario que realiza la compra
        user_doc = db.collection("usuarios").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        user_email = user_doc.to_dict().get('email')
        
        # Validar y actualizar stock de productos
        for producto_item in compra_dict['productos']:
            producto_id = producto_item['id']
            cantidad_comprada = producto_item['quantity']
            
            # Obtener el producto actual
            producto_ref = db.collection("productos").document(producto_id)
            producto_doc = producto_ref.get()
            
            if not producto_doc.exists:
                raise HTTPException(status_code=404, detail=f"Producto {producto_id} no encontrado")
            
            producto_data = producto_doc.to_dict()
            
            # Verificar que el usuario no esté comprando su propio producto
            if producto_data.get('usuario_email') == user_email:
                raise HTTPException(
                    status_code=400, 
                    detail=f"No puedes comprar tu propio producto: {producto_data.get('nombre', 'producto')}"
                )
            
            stock_actual = producto_data.get('stock', 0)
            
            # Verificar que hay suficiente stock
            if stock_actual < cantidad_comprada:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Stock insuficiente para {producto_data.get('nombre', 'producto')}. Disponible: {stock_actual}, solicitado: {cantidad_comprada}"
                )
            
            # Actualizar el stock
            nuevo_stock = stock_actual - cantidad_comprada
            producto_ref.update({"stock": nuevo_stock})
        
        # Registrar la compra después de actualizar el stock
        db.collection("compras").add(compra_dict)
        return {"message": "Compra guardada correctamente y stock actualizado"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/compras")
async def obtener_compras(uid: str):
    try:
        compras_ref = db.collection("compras").where("uid", "==", uid)
        compras = [{"id": compra.id, **compra.to_dict()} for compra in compras_ref.stream()]
        # Ordenar por fecha (asumiendo string ISO)
        compras.sort(key=lambda x: x.get("fecha", ""), reverse=True)
        return compras
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET /usuarios/uid/{uid} → Devuelve un usuario específico por UID
@app.get("/usuarios/uid/{uid}")
async def obtener_usuario_por_uid(uid: str):
    doc = db.collection("usuarios").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"id": doc.id, **doc.to_dict()}

@app.get("/usuarios/email/{email}")
async def obtener_usuario_por_email(email: str):
    email = email.strip().lower()
    usuarios_ref = db.collection("usuarios").where("email", "==", email).limit(1)
    usuarios = list(usuarios_ref.stream())
    if not usuarios:
        # Buscar manualmente por si hay problemas de mayúsculas/minúsculas
        all_users = db.collection("usuarios").stream()
        for user in all_users:
            data = user.to_dict()
            if data.get("email", "").strip().lower() == email:
                return {"id": user.id, **data}
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"id": usuarios[0].id, **usuarios[0].to_dict()}

@app.delete("/articulos/{articulo_id}/comentarios/{comentario_id}")
async def eliminar_comentario(articulo_id: str, comentario_id: str, usuario: str = None):
    try:
        comentario_ref = db.collection("articulos").document(articulo_id).collection("comentarios").document(comentario_id)
        comentario = comentario_ref.get()
        if not comentario.exists:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        if usuario and comentario.to_dict().get("usuario") != usuario:
            raise HTTPException(status_code=403, detail="No tienes permiso para borrar este comentario")
        # Eliminar posibles respuestas
        respuestas_ref = comentario_ref.collection("respuestas").stream()
        for r in respuestas_ref:
            comentario_ref.collection("respuestas").document(r.id).delete()
        comentario_ref.delete()
        return {"message": "Comentario eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/articulos/{articulo_id}/comentarios/{comentario_id}/respuestas/{respuesta_id}")
async def eliminar_respuesta(articulo_id: str, comentario_id: str, respuesta_id: str, usuario: str = None):
    try:
        respuesta_ref = db.collection("articulos").document(articulo_id).collection("comentarios").document(comentario_id).collection("respuestas").document(respuesta_id)
        respuesta = respuesta_ref.get()
        if not respuesta.exists:
            raise HTTPException(status_code=404, detail="Respuesta no encontrada")
        if usuario and respuesta.to_dict().get("usuario") != usuario:
            raise HTTPException(status_code=403, detail="No tienes permiso para borrar esta respuesta")
        respuesta_ref.delete()
        return {"message": "Respuesta eliminada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener artículos de un usuario por UID (usando autor_email)
@app.get("/usuarios/{uid}/articulos")
async def get_user_articles(uid: str):
    try:
        user_doc = db.collection("usuarios").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user_email = user_doc.to_dict().get("email")
        articulos_ref = db.collection("articulos").where("autor_email", "==", user_email)
        articulos = [{"id": doc.id, **doc.to_dict()} for doc in articulos_ref.stream()]
        return articulos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint para obtener productos en venta de un usuario por UID (usando usuario_email)
@app.get("/usuarios/{uid}/ventas")
async def get_user_ventas(uid: str):
    try:
        user_doc = db.collection("usuarios").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user_email = user_doc.to_dict().get("email")
        productos_ref = db.collection("productos").where("usuario_email", "==", user_email)
        productos = [{"id": doc.id, **doc.to_dict()} for doc in productos_ref.stream()]
        return productos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
