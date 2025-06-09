# 🎮 CRPG Game Hub — Plataforma de Artículos y Tienda de Videojuegos de Segunda Mano

## 📝 Descripción
CRPG Game Hub es una plataforma web moderna que combina un blog colaborativo especializado en videojuegos CRPG (Computer Role-Playing Games) con una tienda de compraventa de productos de segunda mano entre usuarios. La plataforma está diseñada para crear una comunidad activa de entusiastas de los videojuegos clásicos, permitiendo tanto la compraventa de juegos como el intercambio de conocimiento y experiencias.

## 🎯 Motivación
La motivación principal detrás de CRPG Game Hub es crear un espacio dedicado para los amantes de los CRPGs, un género que ha sido fundamental en la historia de los videojuegos pero que a menudo no recibe la atención que merece en las plataformas actuales. La plataforma busca:
- Preservar y celebrar la historia de los CRPGs
- Facilitar el acceso a juegos clásicos difíciles de encontrar
- Crear una comunidad activa de entusiastas
- Proporcionar un espacio para el intercambio de conocimiento y experiencias

## 💡 Justificación
La creación de CRPG Game Hub se justifica por varias razones:
1. **Necesidad de un espacio especializado**: No existe una plataforma dedicada exclusivamente a los CRPGs que combine contenido editorial y comercio.
2. **Preservación del patrimonio**: Los CRPGs son parte fundamental de la historia de los videojuegos y merecen un espacio dedicado.
3. **Comunidad activa**: Existe una comunidad activa de entusiastas que necesita un espacio para interactuar y compartir.
4. **Mercado de segunda mano**: Los juegos clásicos son difíciles de encontrar y una plataforma especializada facilitaría su compraventa.

## 🚀 Instalación y Configuración

### Prerrequisitos
Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 18 o superior)
- **Python** (versión 3.8 o superior)
- **npm** o **yarn**
- **pip** (gestor de paquetes de Python)
- **Git**

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd TFG/App
```

### 2. Configuración del Frontend
```bash
# Instalar dependencias del frontend
npm install

# O con yarn
yarn install
```

### 3. Configuración del Backend
```bash
# Navegar al directorio del backend
cd src/backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias de Python
pip install -r requirements.txt
```

### 4. Configuración de Servicios Externos

#### Firebase Setup
1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Habilitar Authentication con Google Provider
4. Descargar el archivo de configuración del servicio
5. Configurar las reglas de seguridad de Firestore

#### Cloudinary Setup
1. Crear una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener las credenciales de API (Cloud Name, API Key, API Secret)

#### Ollama Setup (IA Virtual Assistant)
1. Instalar [Ollama](https://ollama.ai/)
2. Descargar el modelo Mistral:
```bash
ollama pull mistral
```

### 5. Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=tu-client-email
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=tu-cert-url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral

# Application Configuration
SECRET_KEY=tu-secret-key-para-jwt
DEBUG=true
FRONTEND_URL=http://localhost:4321
```

### 6. Ejecutar la Aplicación

#### Ejecutar el Backend
```bash
# En el directorio src/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Ejecutar el Frontend
```bash
# En el directorio raíz del proyecto
npm run dev

# O con yarn
yarn dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:4321
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 🛠️ Stack Tecnológico Completo

### Frontend
| Tecnología | Versión | Función |
|------------|---------|---------|
| **Astro** | 5.7.4 | Framework base para el frontend estático |
| **React** | 19.0.0 | Componentes dinámicos e interactivos |
| **TypeScript** | 5.7.2 | Tipado estático para mayor robustez |
| **Tailwind CSS** | 4.2.4 | Framework CSS para diseño responsivo |
| **React Icons** | 5.4.0 | Biblioteca de iconos moderna |
| **React Hook Form** | 7.55.0 | Gestión de formularios |
| **Zustand** | 5.0.2 | Gestión de estado global |
| **Lucide React** | 0.468.0 | Iconos adicionales |

### Backend
| Tecnología | Versión | Función |
|------------|---------|---------|
| **FastAPI** | 0.115.6 | Framework web para API REST |
| **Python** | 3.8+ | Lenguaje de programación backend |
| **Uvicorn** | 0.32.1 | Servidor ASGI para FastAPI |
| **Firebase Admin** | 6.6.0 | SDK para Firebase en backend |
| **Cloudinary** | 1.41.0 | Gestión de imágenes en la nube |
| **python-multipart** | 0.0.20 | Manejo de formularios multipart |
| **PyJWT** | 2.10.1 | Autenticación con JSON Web Tokens |
| **Requests** | 2.32.3 | Cliente HTTP para integraciones |
| **python-dotenv** | 1.0.1 | Gestión de variables de entorno |

### Base de Datos y Servicios
| Servicio | Función |
|----------|---------|
| **Firebase Firestore** | Base de datos NoSQL en tiempo real |
| **Firebase Auth** | Autenticación de usuarios |
| **Google OAuth** | Autenticación con Google |
| **Cloudinary** | Almacenamiento y optimización de imágenes |
| **Ollama + Mistral** | Asistente virtual con IA |

### Herramientas de Desarrollo
| Herramienta | Función |
|-------------|---------|
| **@astrojs/check** | 0.9.5 | Verificación de tipos en Astro |
| **@astrojs/react** | 4.0.1 | Integración de React con Astro |
| **@astrojs/tailwind** | 5.2.1 | Integración de Tailwind con Astro |
| **@astrojs/ts-plugin** | 1.10.3 | Plugin TypeScript para Astro |

## 📱 Características Principales

### 🔐 Sistema de Autenticación
- Registro y login con email/contraseña
- Autenticación con Google OAuth
- Gestión de sesiones con JWT
- Perfiles personalizables
- Roles de usuario (normal/admin)
- Recuperación de contraseña

### 🛒 Tienda E-commerce
- Catálogo completo de productos
- Sistema de favoritos
- Carrito de compras funcional
- Gestión de ventas
- Subida de imágenes con Cloudinary
- Filtros y búsqueda avanzada
- Sistema de compras mock

### 📰 Blog Colaborativo
- Artículos colaborativos sobre CRPGs
- Editor de contenido avanzado
- Sistema de comentarios anidados
- Likes y sistema de favoritos
- Búsqueda y filtros de contenido
- Gestión de categorías

### 💬 Interacción Social
- Comentarios con respuestas anidadas
- Sistema de likes en tiempo real
- Compartir contenido
- Newsletter con suscripciones
- Chat en tiempo real con WebSockets
- Asistente virtual con IA (Ollama + Mistral)

### 🎨 Experiencia de Usuario
- Diseño responsivo y moderno
- Interfaz intuitiva con Tailwind CSS
- Componentes reutilizables en React
- Estado global con Zustand
- Navegación fluida con Astro
- Optimización de imágenes automática

### 🔧 Panel de Administración
- Gestión de usuarios
- Moderación de contenido
- Estadísticas de la plataforma
- Gestión de productos y artículos
- Sistema de roles y permisos

## 🎨 Esquema del Front-end

### 1. Página Principal (HomePage)
- Hero section con llamada a la acción
- Slider de productos destacados
- Sección de artículos destacados
- Newsletter para suscripción

### 2. Tienda (TiendaPage)
- Catálogo de productos
- Filtros de búsqueda
- Sistema de favoritos
- Carrito de compras
- Detalles de producto

### 3. Blog (BlogPage)
- Listado de artículos
- Búsqueda y filtros
- Sistema de comentarios
- Likes y favoritos
- Vista detallada de artículos

### 4. Perfil de Usuario (Profile)
- Información personal
- Historial de compras
- Productos favoritos
- Artículos guardados
- Gestión de cuenta

### 5. Gestión de Productos (MyProducts)
- Listado de productos publicados
- Estadísticas de ventas
- Gestión de stock
- Edición de productos

### 6. Artículos del Usuario (MyArticles)
- Listado de artículos publicados
- Estadísticas de engagement
- Gestión de comentarios
- Edición de artículos

## 📁 Estructura del Proyecto

```txt
/
├── public/                          # Archivos estáticos
│   ├── grid.svg                     # Fondo decorativo
│   └── icons/                       # Iconos de la aplicación
├── src/
│   ├── components/                  # Componentes React
│   │   ├── Navbar.tsx              # Barra de navegación
│   │   ├── Footer.tsx              # Pie de página
│   │   ├── Hero.tsx                # Sección hero
│   │   ├── ProductCard.tsx         # Tarjeta de producto
│   │   ├── ArticleCard.tsx         # Tarjeta de artículo
│   │   ├── LoginForm.tsx           # Formulario de login
│   │   ├── ProductForm.tsx         # Formulario de productos
│   │   ├── ArticleForm.tsx         # Formulario de artículos
│   │   ├── Comments.tsx            # Sistema de comentarios
│   │   ├── Cart.tsx                # Carrito de compras
│   │   ├── ChatBot.tsx             # Asistente virtual
│   │   └── common/                 # Componentes comunes
│   ├── layouts/                     # Layouts de páginas
│   │   └── BaseLayout.astro        # Layout base
│   ├── pages/                       # Páginas de la aplicación
│   │   ├── index.astro             # Página de inicio
│   │   ├── tienda.astro            # Tienda de productos
│   │   ├── blog.astro              # Blog de artículos
│   │   ├── login.astro             # Página de login
│   │   ├── profile.astro           # Perfil de usuario
│   │   ├── producto/[id].astro     # Detalle de producto
│   │   ├── articulo/[id].astro     # Detalle de artículo
│   │   ├── my-products.astro       # Mis productos
│   │   └── my-articles.astro       # Mis artículos
│   ├── backend/                     # Backend FastAPI
│   │   ├── main.py                 # Aplicación principal
│   │   ├── firebase_config.py      # Configuración Firebase
│   │   ├── cloudinary_config.py    # Configuración Cloudinary
│   │   ├── models/                 # Modelos de datos
│   │   │   ├── user.py             # Modelo de usuario
│   │   │   ├── product.py          # Modelo de producto
│   │   │   ├── article.py          # Modelo de artículo
│   │   │   └── comment.py          # Modelo de comentario
│   │   ├── routes/                 # Rutas de la API
│   │   │   ├── auth.py             # Autenticación
│   │   │   ├── products.py         # Productos
│   │   │   ├── articles.py         # Artículos
│   │   │   ├── comments.py         # Comentarios
│   │   │   ├── users.py            # Usuarios
│   │   │   ├── chat.py             # Chat y WebSockets
│   │   │   └── ai.py               # Asistente IA
│   │   ├── middleware/             # Middleware personalizado
│   │   └── utils/                  # Utilidades
│   ├── stores/                      # Estado global (Zustand)
│   │   ├── authStore.ts            # Estado de autenticación
│   │   ├── cartStore.ts            # Estado del carrito
│   │   └── chatStore.ts            # Estado del chat
│   └── types/                       # Tipos TypeScript
│       ├── user.ts                 # Tipos de usuario
│       ├── product.ts              # Tipos de producto
│       └── article.ts              # Tipos de artículo
├── astro.config.mjs                # Configuración Astro
├── tailwind.config.mjs             # Configuración Tailwind
├── tsconfig.json                   # Configuración TypeScript
├── package.json                    # Dependencias frontend
├── requirements.txt                # Dependencias Python
├── .env                            # Variables de entorno
└── README.md                       # Este archivo
```

## 🚨 Resolución de Problemas Comunes

### Error de Firebase
Si encuentras errores relacionados con Firebase:
1. Verifica que todas las variables de entorno estén configuradas correctamente
2. Asegúrate de que el proyecto Firebase esté activo
3. Revisa las reglas de Firestore

### Error de Cloudinary
Si hay problemas con la subida de imágenes:
1. Verifica las credenciales de Cloudinary en el archivo `.env`
2. Asegúrate de que la cuenta de Cloudinary esté activa

### Error de Ollama
Si el asistente virtual no funciona:
1. Verifica que Ollama esté instalado y ejecutándose
2. Asegúrate de que el modelo Mistral esté descargado
3. Verifica que el puerto 11434 esté disponible

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Sigue las convenciones de código establecidas
- Añade tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos y claros

## 🎯 Resumen Técnico

CRPG Game Hub es una aplicación full-stack moderna que combina:
- **Frontend**: Astro + React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python con arquitectura modular
- **Base de datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth + Google OAuth
- **Almacenamiento**: Cloudinary para imágenes
- **IA**: Ollama + Mistral para asistente virtual
- **Tiempo real**: WebSockets para chat
- **Estado**: Zustand para gestión de estado global

La aplicación está completamente preparada para producción con todas las configuraciones necesarias para un despliegue escalable y mantiene una arquitectura limpia y modular que facilita el mantenimiento y la extensión de funcionalidades.

---

## 🏆 Características Avanzadas

### Arquitectura Modular
- Separación clara entre frontend y backend
- Componentes reutilizables en React
- Rutas organizadas por dominio en FastAPI
- Modelos de datos bien definidos

### Rendimiento
- Optimización de imágenes con Cloudinary
- Carga lazy de componentes
- Cache inteligente de datos
- Minificación automática en producción

### Seguridad
- Autenticación JWT segura
- Validación de datos en frontend y backend
- Sanitización de inputs
- Reglas de seguridad en Firestore

### Escalabilidad
- Arquitectura serverless ready
- Base de datos NoSQL escalable
- CDN para assets estáticos
- API REST bien estructurada

La plataforma está diseñada siguiendo las mejores prácticas de desarrollo web moderno y está lista para crecer junto con la comunidad de usuarios.
