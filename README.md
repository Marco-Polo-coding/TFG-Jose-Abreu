# 🎮 CRPGHub — Plataforma de Artículos y Tienda de Videojuegos de Segunda Mano

## 📝 Descripción
CRPGHub es una plataforma web moderna que combina un blog colaborativo especializado en videojuegos CRPG (Computer Role-Playing Games) con una tienda de compraventa de productos de segunda mano entre usuarios. La plataforma está diseñada para crear una comunidad activa de entusiastas de los videojuegos clásicos, permitiendo tanto la compraventa de juegos como el intercambio de conocimiento y experiencias.

## 🎯 Motivación
La motivación principal detrás de CRPGHub es crear un espacio dedicado para los amantes de los CRPGs, un género que ha sido fundamental en la historia de los videojuegos pero que a menudo no recibe la atención que merece en las plataformas actuales. La plataforma busca:
- Preservar y celebrar la historia de los CRPGs
- Facilitar el acceso a juegos clásicos difíciles de encontrar
- Crear una comunidad activa de entusiastas
- Proporcionar un espacio para el intercambio de conocimiento y experiencias

## 💡 Justificación
La creación de CRPGHub se justifica por varias razones:
1. **Necesidad de un espacio especializado**: No existe una plataforma dedicada exclusivamente a los CRPGs que combine contenido editorial y comercio.
2. **Preservación del patrimonio**: Los CRPGs son parte fundamental de la historia de los videojuegos y merecen un espacio dedicado.
3. **Comunidad activa**: Existe una comunidad activa de entusiastas que necesita un espacio para interactuar y compartir.
4. **Mercado de segunda mano**: Los juegos clásicos son difíciles de encontrar y una plataforma especializada facilitaría su compraventa.

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

## 🛠️ Tecnologías Implementadas

### Frontend
- **Astro**: Framework base para el frontend
- **React**: Componentes dinámicos
- **Tailwind CSS**: Estilos y diseño responsivo
- **React Icons**: Iconografía moderna

### Backend
- **FastAPI**: API REST
- **Firebase**: 
  - Autenticación
  - Base de datos (Firestore)
  - Almacenamiento

## 📱 Características Principales

### Sistema de Usuarios
- Registro y login
- Autenticación con Google
- Perfiles personalizables
- Roles de usuario (normal/admin)

### Tienda
- Catálogo de productos
- Sistema de favoritos
- Carrito de compras
- Gestión de ventas

### Blog
- Artículos colaborativos
- Sistema de comentarios
- Likes y favoritos
- Búsqueda avanzada

### Interacción Social
- Comentarios anidados
- Sistema de likes
- Compartir contenido
- Newsletter

## 🚀 Próximas Funcionalidades
- Sistema de mensajería entre usuarios
- Sistema de valoraciones
- Integración con más métodos de pago
- App móvil
- Sistema de notificaciones en tiempo real

---

## ✨ Características principales

### 📰 Blog colaborativo
- Artículos sobre historia y evolución de los CRPGs
- Comentarios con respuestas anidadas
- Likes y favoritos
- Vista de detalle para cada post

### 🛒 Tienda entre usuarios
- Publicación de productos de segunda mano
- Likes, guardado, sistema mock de compra
- Detalle de producto con imagen, precio, vendedor
- Futuras funcionalidades: filtros, carrito, stock dinámico

### 👥 Gestión de usuarios
- Firebase Auth con login por email y Google
- Roles: usuario y administrador
- Panel de usuario con historial de favoritos, compras y publicaciones (en desarrollo)

### 🔐 Backend desacoplado (FastAPI)
- API REST para productos, artículos, comentarios, usuarios y compras
- Base de datos en Firebase Firestore
- Comentarios y respuestas como subcolecciones

---

## 🛠️ Tecnologías usadas

| Tecnología       | Función                            |
|------------------|-------------------------------------|
| **Astro**        | Framework base del frontend         |
| **React**        | Componentes dinámicos (productos, artículos, login) |
| **Tailwind CSS** | Diseño moderno y responsivo         |
| **FastAPI**      | Backend y endpoints API REST        |
| **Firebase**     | Autenticación y base de datos       |

---

## 📁 Estructura del proyecto

```txt
/
├── public/                     # Archivos estáticos
│   └── grid.svg (fondo decorativo)
├── src/
│   ├── components/             # Componentes React
│   ├── layouts/                # Layout base de páginas
│   ├── pages/                 
│   │   ├── index.astro         # Página de inicio
│   │   ├── producto/[id].astro # Vista de detalle de producto
│   │   ├── articulo/[id].astro # Vista de detalle de artículo
│   │   ├── tienda.astro        # (En desarrollo)
│   │   └── blog.astro          # (En desarrollo)
├── firebase_config.py          # Configuración Firebase
├── main.py                     # FastAPI backend
├── .env                        # Variables de entorno
└── README.md                   # Este archivo
