from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form, File, UploadFile
from firebase_config import db
from auth import router as auth_router
from firebase_admin import firestore
from typing import List, Dict, Any, Optional
from datetime import datetime
from cloudinary_config import *  # Importar la configuración
import cloudinary.uploader

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
async def get_productos():
    productos_ref = db.collection("productos").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in productos_ref]

@app.get("/productos/{producto_id}", response_model=Dict[str, Any])
async def obtener_producto(producto_id: str):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"id": producto.id, **producto.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/productos", response_model=Dict[str, Any])
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria: str = Form(...),
    estado: str = Form(...),
    imagen: Optional[UploadFile] = File(None),
    usuario_email: Optional[str] = Form(None)
):

    try:
        url_imagen = "https://cataas.com/cat"  # Imagen por defecto
        if imagen is not None:
            try:
                if hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
                    contents = await imagen.read()
                    result = cloudinary.uploader.upload(
                        contents,
                        folder="product_images",
                        resource_type="auto"
                    )
                    url_imagen = result["secure_url"]
            except Exception as img_err:
                print("Error subiendo imagen a Cloudinary:", img_err)

        producto_ref = db.collection("productos").document()
        producto = {
            "id": producto_ref.id,
            "nombre": nombre,
            "descripcion": descripcion,
            "precio": precio,
            "stock": stock,
            "categoria": categoria,
            "estado": estado,
            "imagen": url_imagen,
            "fecha_creacion": datetime.now().isoformat()
        }
        if usuario_email:
            producto["usuario_email"] = usuario_email
        producto_ref.set(producto)
        return {"id": producto_ref.id, **producto}
    except Exception as e:
        print("Error en crear_producto:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/productos/{producto_id}", response_model=Dict[str, Any])
async def actualizar_producto(
    producto_id: str,
    nombre: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    precio: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    categoria: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    imagen: Optional[UploadFile] = File(None)
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

        if imagen is not None and hasattr(imagen, 'filename') and imagen.filename and hasattr(imagen, 'content_type') and imagen.content_type and imagen.content_type.startswith("image/"):
            contents = await imagen.read()
            result = cloudinary.uploader.upload(
                contents,
                folder="product_images",
                resource_type="auto"
            )
            data["imagen"] = result["secure_url"]

        if not data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

        producto_ref.update(data)
        producto_actualizado = producto_ref.get().to_dict()
        producto_actualizado["id"] = producto_id
        return producto_actualizado
    except Exception as e:
        print("Error en actualizar_producto:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        producto_ref = db.collection("productos").document(producto_id)
        producto = producto_ref.get()
        
        if not producto.exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        producto_data = producto.to_dict()
        print(f"\n[ELIMINACIÓN] Iniciando eliminación del producto: {producto_data.get('nombre', 'Sin nombre')} (ID: {producto_id})")
        
        if producto_data.get("imagen") and "cloudinary.com" in producto_data["imagen"]:
            try:
                url_parts = producto_data["imagen"].split("/")
                upload_index = url_parts.index("upload") + 1
                public_id = "/".join(url_parts[upload_index + 1:]).split(".")[0]
                result = cloudinary.uploader.destroy(public_id)
                print(f"[ELIMINACIÓN] Resultado de eliminación de imagen: {result}")
            except Exception as img_err:
                print(f"[ERROR] Error eliminando imagen de Cloudinary: {str(img_err)}")
        
        producto_ref.delete()
        print(f"[ELIMINACIÓN] Producto eliminado correctamente de la base de datos")
        return {"message": "Producto eliminado correctamente"}
    except Exception as e:
        print(f"[ERROR] Error en eliminar_producto: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Endpoint para obtener productos de un usuario específico
@app.get("/usuarios/{usuario_id}/productos", response_model=List[Dict[str, Any]])
async def obtener_productos_usuario(usuario_id: str):
    try:
        productos_ref = db.collection("productos").where("usuario_email", "==", usuario_id)
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
            except Exception as img_err:
                print("Error subiendo imagen a Cloudinary:", img_err)
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
        print("Error en crear_articulo:", e)
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
