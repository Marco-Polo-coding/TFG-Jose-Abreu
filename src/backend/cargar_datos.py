import json
import os
from firebase_config import db

# Ruta base a la carpeta "data" donde están los JSON
BASE_PATH = os.path.join(os.path.dirname(__file__), "data")

def subir_coleccion(nombre_archivo, nombre_coleccion):
    ruta_archivo = os.path.join(BASE_PATH, nombre_archivo)
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        data = json.load(f)[nombre_coleccion]
        for doc_id, contenido in data.items():
            db.collection(nombre_coleccion).document(doc_id).set(contenido)
        print(f"✅ {len(data)} documentos subidos a '{nombre_coleccion}'")

# Ejecutar para cada colección
subir_coleccion("usuarios.json", "usuarios")
subir_coleccion("productos.json", "productos")
subir_coleccion("compras.json", "compras")
subir_coleccion("articulos.json", "articulos")
