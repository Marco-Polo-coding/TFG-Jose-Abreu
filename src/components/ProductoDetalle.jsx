import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowLeft, FaHome } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';

const ProductoDetalle = ({ id }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/productos")
      .then((res) => res.json())
      .then((data) => {
        const productoEncontrado = data.find(p => p.id === id);
        setProducto(productoEncontrado);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el producto:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar el producto que buscas.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <FaHome className="w-5 h-5" />
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
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
              <a
                href="/tienda"
                className="text-white hover:text-purple-200 transition-colors"
              >
                Tienda
              </a>
              <span className="text-white/50">/</span>
              <span className="text-white/50">{producto.nombre}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {producto.nombre}
            </h1>
            <p className="text-2xl text-purple-200">
              ${producto.precio}
            </p>
          </div>
        </div>
      </section>

      {/* Detalles del Producto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del Producto */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-[500px] object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    // Lógica para dar like
                  }}
                  className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaHeart className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => {
                    // Lógica para guardar
                  }}
                  className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-yellow-500 transition-colors"
                >
                  <FaBookmark className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Información del Producto */}
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Descripción
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-purple-600">
                      ${producto.precio}
                    </h3>
                    <p className="text-gray-500">Precio final</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        // Lógica para añadir al carrito
                      }}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <FaShoppingCart className="w-5 h-5" />
                      Añadir al Carrito
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Información adicional
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Envío seguro y rápido</li>
                    <li>• Garantía de 30 días</li>
                    <li>• Soporte técnico incluido</li>
                    <li>• Producto en excelente estado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductoDetalle;