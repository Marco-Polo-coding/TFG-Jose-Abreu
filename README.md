# 🎮 CRPGHub — Plataforma de Artículos y Tienda de Videojuegos de Segunda Mano

**CRPGHub** es una plataforma web que combina un blog colaborativo sobre videojuegos clásicos con una tienda de compraventa de productos entre usuarios. Está desarrollada como parte de mi Trabajo de Fin de Grado, con enfoque en diseño web moderno, frontend con Astro + React, backend con FastAPI y base de datos en Firebase.

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
