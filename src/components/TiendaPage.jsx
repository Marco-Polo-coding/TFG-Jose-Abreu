import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaShoppingCart } from "react-icons/fa";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <a
                href="/"
                className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
              >
                <FaHome className="w-5 h-5" />
                <span>Inicio</span>
              </a>
              <span className="text-white/50">/</span>
              <span className="text-white/50">Tienda</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Tienda de Segunda Mano
            </h1>
            <p className="text-xl md:text-2xl">
              Descubre juegos clásicos a precios increíbles
            </p>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {productos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No hay productos disponibles
              </h2>
              <p className="text-gray-600">
                Por ahora no tenemos productos en la tienda. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {
                          // Lógica para dar like
                        }}
                        className="bg-white/90 p-2 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaHeart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Lógica para guardar
                        }}
                        className="bg-white/90 p-2 rounded-full text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
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
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={`/producto/${producto.id}`}
                        className="flex-1 bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Ver más
                      </a>
                      <button
                        onClick={() => {
                          // Lógica para añadir al carrito
                        }}
                        className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <FaShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TiendaPage; 