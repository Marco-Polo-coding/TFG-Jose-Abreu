import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaShoppingCart, FaArrowRight, FaBoxOpen } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';

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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Botón flotante para subir producto */}
      <a
        href="/upload_product"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group overflow-hidden px-6 py-4 hover:scale-105 hover:shadow-xl"
        title="Subir nuevo producto"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.25)' }}
      >
        <span className="flex items-center justify-center w-8 h-8 text-2xl font-bold transition-all duration-300 group-hover:mr-2">
          <FaBoxOpen />
        </span>
        <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs group-hover:pl-2 transition-all duration-300 text-base font-semibold">
          Subir un nuevo producto
        </span>
      </a>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden">
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
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-xl">
              Tienda de Segunda Mano
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow">
              Descubre juegos clásicos a precios increíbles
            </p>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section className="py-16 bg-gray-50">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60"
                >
                  <div className="relative h-48 bg-gray-200 group">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => {
                          // Lógica para dar like
                        }}
                        className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors hover:scale-110 shadow"
                        title="Me gusta"
                      >
                        <FaHeart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Lógica para guardar
                        }}
                        className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-yellow-500 transition-colors hover:scale-110 shadow"
                        title="Guardar"
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{producto.nombre}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {producto.descripcion}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-extrabold text-purple-700">
                        {producto.precio}€
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={`/producto/${producto.id}`}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold shadow"
                      >
                        Ver más <FaArrowRight className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          // Lógica para añadir al carrito
                        }}
                        className="bg-purple-100 text-purple-600 p-3 rounded-full hover:bg-purple-200 transition-all duration-300 hover:scale-110 shadow"
                        title="Añadir al carrito"
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