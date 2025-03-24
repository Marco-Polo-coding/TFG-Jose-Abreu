import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Cargar variables del entorno
load_dotenv()

# Obtener la ruta absoluta
base_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(base_dir, os.getenv("FIREBASE_CREDENTIALS"))

# Inicializar Firebase
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# Conexión a Firestore
db = firestore.client()
