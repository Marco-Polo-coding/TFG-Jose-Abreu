from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from firebase_config import db
from middleware import verify_admin

router = APIRouter()

# Obtener todos los usuarios
@router.get("/users")
async def get_all_users(admin: Dict = Depends(verify_admin)):
    try:
        users = db.collection("usuarios").stream()
        return [{"id": user.id, **user.to_dict()} for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Obtener todos los productos
@router.get("/products")
async def get_all_products(admin: Dict = Depends(verify_admin)):
    try:
        products = db.collection("productos").stream()
        return [{"id": product.id, **product.to_dict()} for product in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Obtener todos los artículos
@router.get("/articles")
async def get_all_articles(admin: Dict = Depends(verify_admin)):
    try:
        articles = db.collection("articulos").stream()
        return [{"id": article.id, **article.to_dict()} for article in articles]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Obtener estadísticas generales
@router.get("/stats")
async def get_stats(admin: Dict = Depends(verify_admin)):
    try:
        # Contar usuarios
        users_count = len(list(db.collection("usuarios").stream()))
        
        # Contar productos
        products_count = len(list(db.collection("productos").stream()))
        
        # Contar artículos
        articles_count = len(list(db.collection("articulos").stream()))
        
        return {
            "total_users": users_count,
            "total_products": products_count,
            "total_articles": articles_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Eliminar un usuario
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: Dict = Depends(verify_admin)):
    try:
        # Verificar que el usuario existe
        user_ref = db.collection("usuarios").document(user_id)
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Eliminar usuario
        user_ref.delete()
        return {"message": "Usuario eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Eliminar un producto
@router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: Dict = Depends(verify_admin)):
    try:
        # Verificar que el producto existe
        product_ref = db.collection("productos").document(product_id)
        if not product_ref.get().exists:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
            
        # Eliminar producto
        product_ref.delete()
        return {"message": "Producto eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Eliminar un artículo
@router.delete("/articles/{article_id}")
async def delete_article(article_id: str, admin: Dict = Depends(verify_admin)):
    try:
        # Verificar que el artículo existe
        article_ref = db.collection("articulos").document(article_id)
        if not article_ref.get().exists:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
            
        # Eliminar artículo
        article_ref.delete()
        return {"message": "Artículo eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 