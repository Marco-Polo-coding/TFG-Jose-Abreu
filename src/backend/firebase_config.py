import firebase_admin
from firebase_admin import credentials, firestore

# Inicializar Firebase Admin
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Obtener la instancia de Firestore
db = firestore.client() 