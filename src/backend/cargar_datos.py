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
            doc_ref = db.collection(nombre_coleccion).document(doc_id)

            # Si es 'articulos' y contiene comentarios, hay que subir subcolecciones
            if nombre_coleccion == "articulos" and "comentarios" in contenido:
                comentarios = contenido.pop("comentarios")  # extraer y eliminar de contenido principal
                doc_ref.set(contenido)

                for comentario_id, comentario_data in comentarios.items():
                    com_ref = doc_ref.collection("comentarios").document(comentario_id)
                    respuestas = comentario_data.pop("respuestas", {})  # extraer respuestas si existen
                    com_ref.set(comentario_data)

                    for respuesta_id, respuesta_data in respuestas.items():
                        com_ref.collection("respuestas").document(respuesta_id).set(respuesta_data)

            else:
                # Para usuarios, productos y compras
                doc_ref.set(contenido)

        print(f"✅ {len(data)} documentos subidos a '{nombre_coleccion}'")

# Ejecutar para cada colección
# subir_coleccion("usuarios.json", "usuarios")
# subir_coleccion("productos.json", "productos")
# subir_coleccion("compras.json", "compras")
# subir_coleccion("articulos.json", "articulos")

def limpiar_fotos_google():
    usuarios_ref = db.collection("usuarios").stream()
    for user in usuarios_ref:
        data = user.to_dict()
        if "foto" in data and data["foto"] and "googleusercontent.com" in data["foto"]:
            print(f"Limpiando foto de usuario: {data.get('email', user.id)}")
            db.collection("usuarios").document(user.id).update({"foto": ""})

if __name__ == "__main__":
    limpiar_fotos_google()
    print("Limpieza completada.")
