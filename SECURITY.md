# CONFIGURACIÓN DE SEGURIDAD

## Configuración de Variables de Entorno

Este proyecto utiliza variables de entorno para manejar claves API y configuraciones sensibles. 

### Configuración Inicial

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y reemplaza los valores placeholder con tus claves reales:
   - `FIREBASE_API_KEY`: Tu clave de API de Firebase
   - `OPENAI_API_KEY`: Tu clave de API de OpenAI
   - `CLOUDINARY_*`: Tus credenciales de Cloudinary

### Regeneración de Claves

**IMPORTANTE**: Si has clonado este repositorio después del 9 de junio de 2025, necesitas generar nuevas claves de Firebase:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Configuración del proyecto > General
4. En la sección "Tus aplicaciones", regenera la clave de API web
5. Actualiza el archivo `.env` con la nueva clave

### Archivos Sensibles

Los siguientes archivos **NUNCA** deben subirse al repositorio:
- `.env`
- `src/backend/serviceAccountKey.json`
- `src/backend/cloudinary_config.py`
- `*.log`

Estos archivos ya están incluidos en `.gitignore`.

### En Caso de Exposición Accidental

Si accidentally expones una clave API:

1. Regenera inmediatamente la clave en el servicio correspondiente
2. Actualiza tu archivo `.env` local
3. Si la clave fue subida al repositorio, contacta al administrador del proyecto

## Contacto

Si encuentras algún problema de seguridad, por favor contacta al equipo de desarrollo inmediatamente.
