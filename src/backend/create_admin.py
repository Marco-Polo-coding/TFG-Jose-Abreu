import os
from firebase_admin import auth
from firebase_config import db
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env en la raíz del proyecto
load_dotenv(dotenv_path="../../.env")

def create_admin_user():
    try:
        # Obtener credenciales del admin desde variables de entorno
        admin_email = os.getenv('ADMIN_EMAIL')
        admin_password = os.getenv('ADMIN_PASSWORD')
        
        if not admin_email or not admin_password:
            print("Error: ADMIN_EMAIL y ADMIN_PASSWORD deben estar configurados en el archivo .env")
            return
            
        # Crear usuario en Firebase Auth
        user_record = auth.create_user(
            email=admin_email,
            password=admin_password,
            display_name="Administrador"
        )
        
        # Guardar información en Firestore
        admin_data = {
            "uid": user_record.uid,
            "email": admin_email,
            "nombre": "Administrador",
            "role": "admin"
        }
        
        db.collection("usuarios").document(user_record.uid).set(admin_data)
        
        print(f"Usuario administrador creado exitosamente: {admin_email}")
        
    except Exception as e:
        print(f"Error al crear usuario administrador: {str(e)}")

if __name__ == "__main__":
    create_admin_user() 