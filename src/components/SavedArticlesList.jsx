import React from 'react';
import { FaArrowRight, FaBookmark } from 'react-icons/fa';

// Datos de ejemplo (reemplazar por fetch a la API en el futuro)
const savedArticles = [];
// Ejemplo de estructura:
// const savedArticles = [
//   { id: 1, titulo: 'Título del artículo', autor: 'Autor', fecha: '2024-03-15', imagen: '/ruta.jpg', descripcion: 'Resumen...' },
// ];

const SavedArticlesList = () => {
  if (!savedArticles.length) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-full shadow-lg text-4xl">
            <FaBookmark />
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes artículos guardados</h2>
        <p className="text-gray-600 mb-6">Cuando guardes artículos, aparecerán aquí para que los leas cuando quieras.</p>
        <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
          Ir al blog <FaArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {savedArticles.map((articulo) => (
        <div key={articulo.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative h-48 bg-gray-200">
            <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover" />
            <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full shadow-lg">
              <FaBookmark />
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{articulo.descripcion}</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Por {articulo.autor} • {new Date(articulo.fecha).toLocaleDateString()}
              </div>
            </div>
            <a href={`/articulo/${articulo.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold">
              Leer más <FaArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedArticlesList; 