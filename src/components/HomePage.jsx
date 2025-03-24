import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark } from "react-icons/fa";

const HomePage = () => {
  const [productos, setProductos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Cargar productos destacados
    fetch("http://localhost:8000/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error("Error al obtener productos:", error));

    // Cargar artículos recientes
    fetch("http://localhost:8000/articulos")
      .then((res) => res.json())
      .then((data) => setArticulos(data))
      .catch((error) => console.error("Error al obtener artículos:", error));
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para manejar la suscripción
    console.log("Email suscrito:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Tu Comunidad de CRPGs
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Descubre juegos clásicos, lee artículos y comparte tu pasión por los CRPGs
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Explorar ahora
            </button>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => (
              <a
                href={`/producto/producto_${producto.id}`}
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{producto.nombre}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{producto.descripcion}</p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-purple-600">
                      ${producto.precio}
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Aquí iría la lógica para dar like
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaHeart className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Aquí iría la lógica para guardar
                        }}
                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      // Aquí iría la lógica para añadir al carrito
                    }}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    Añadir al Carrito
                  </button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Artículos Recientes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Artículos Recientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articulos.map((articulo) => (
              <a
                href={`/articulo/${articulo.id}`}
                key={articulo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={articulo.imagen}
                    alt={articulo.titulo}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{articulo.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Aquí iría la lógica para dar like
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaHeart className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Aquí iría la lógica para guardar
                        }}
                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-purple-600 hover:text-purple-700 font-semibold">
                      Leer más →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mantente Informado
          </h2>
          <p className="text-xl mb-8">
            Suscríbete para recibir las últimas noticias y ofertas especiales
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Suscribirse
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 