import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark } from "react-icons/fa";

const TiendaPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/productos")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
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
          Tienda de Segunda Mano
        </h1>

        {productos.length === 0 ? (
          <div className="text-center text-gray-600 text-xl">
            No hay productos disponibles por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{producto.nombre}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {producto.descripcion}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-purple-600">
                      ${producto.precio}
                    </p>
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
                    href={`/producto/${producto.id}`}
                    className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ver más
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

export default TiendaPage; 