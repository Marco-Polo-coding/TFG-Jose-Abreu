import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowRight } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';

const HomePage = () => {
  const [productos, setProductos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/productos").then(res => res.json()),
      fetch("http://localhost:8000/articulos").then(res => res.json())
    ])
      .then(([productosData, articulosData]) => {
        setProductos(productosData);
        setArticulos(articulosData);
        setLoading(false);
        // Pequeño delay para asegurar que el LoadingSpinner se desmonte
        setTimeout(() => {
          setShowContent(true);
        }, 100);
      })
      .catch((error) => {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      });
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Email suscrito:", email);
    setEmail("");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <CartButton />
      <UserButton />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className={`text-white max-w-2xl transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Tu Comunidad de Videojuegos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Descubre juegos clásicos, lee artículos y comparte tu pasión por los CRPGs
            </p>
            <div className="flex gap-4">
              <a 
                href="/tienda"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Explorar ahora
                <FaArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="/blog"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                Leer artículos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className={`py-20 bg-white transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-600">Descubre nuestra selección de juegos clásicos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.slice(0, 3).map((producto, index) => (
              <div
                key={producto.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 transition-all duration-1000 delay-${(index + 1) * 200} ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
                  <p className="text-gray-600 mb-4 line-clamp-2">{producto.descripcion}</p>
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
        </div>
      </section>

      {/* Artículos Recientes */}
      <section className={`py-20 bg-gray-50 transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Artículos Recientes
            </h2>
            <p className="text-gray-600">Las últimas novedades y análisis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articulos.slice(0, 3).map((articulo, index) => (
              <div
                key={articulo.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 transition-all duration-1000 delay-${(index + 1) * 200} ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={articulo.imagen}
                    alt={articulo.titulo}
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
                  <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{articulo.descripcion}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Por {articulo.autor} • {new Date(articulo.fecha).toLocaleDateString()}
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
        </div>
      </section>

      {/* Newsletter */}
      <section className={`py-20 bg-purple-900 text-white relative overflow-hidden transition-all duration-1000 delay-900 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mantente Informado
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Suscríbete para recibir las últimas noticias y ofertas especiales
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
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