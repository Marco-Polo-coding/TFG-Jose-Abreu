import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark } from "react-icons/fa";

const BlogPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/articulos")
      .then((res) => res.json())
      .then((data) => {
        setArticulos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener artículos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Últimos Artículos del Blog
        </h1>

        {articulos.length === 0 ? (
          <div className="text-center text-gray-600 text-xl">
            Todavía no hay artículos publicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articulos.map((articulo) => (
              <div
                key={articulo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={articulo.imagen}
                    alt={articulo.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {articulo.descripcion}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Por {articulo.autor} • {new Date(articulo.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          // Lógica para dar like
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaHeart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Lógica para guardar
                        }}
                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <a
                    href={`/articulo/${articulo.id}`}
                    className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Leer más
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage; 