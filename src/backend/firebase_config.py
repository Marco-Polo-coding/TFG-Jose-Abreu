import os
import firebase_admin
from firebase_admin import credentials, firestore

# Obtener la ruta absoluta
base_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(base_dir, "serviceAccountKey.json")

# Inicializar Firebase
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# Conexión a Firestore
db = firestore.client()
