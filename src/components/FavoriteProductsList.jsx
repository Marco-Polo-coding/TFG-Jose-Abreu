import React from 'react';
import { FaArrowRight, FaHeart } from 'react-icons/fa';

// Datos de ejemplo (reemplazar por fetch a la API en el futuro)
const favoriteProducts = [];
// Ejemplo de estructura:
// const favoriteProducts = [
//   { id: 1, nombre: 'Producto', precio: 25, imagen: '/ruta.jpg', descripcion: 'Resumen...' },
// ];

const FavoriteProductsList = () => {
  if (!favoriteProducts.length) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-full shadow-lg text-4xl">
            <FaHeart />
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes productos favoritos</h2>
        <p className="text-gray-600 mb-6">Cuando marques productos como favoritos, aparecerán aquí para que los encuentres fácilmente.</p>
        <a href="/tienda" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
          Ir a la tienda <FaArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {favoriteProducts.map((producto) => (
        <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative h-48 bg-gray-200">
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
            <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full shadow-lg">
              <FaHeart />
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{producto.nombre}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{producto.descripcion}</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-purple-600">{producto.precio}€</div>
            </div>
            <a href={`/producto/${producto.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold">
              Ver producto <FaArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoriteProductsList; 