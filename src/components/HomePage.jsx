import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowRight } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Slider from './Slider';



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

  const renderProducto = (producto) => (
    <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60">
      <div className="relative h-48 bg-gray-200 group">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* <button 
            onClick={() => {
              // Lógica para dar like
            }}
            className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors hover:scale-110 shadow"
          >
            <FaHeart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              // Lógica para guardar
            }}
            className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-yellow-500 transition-colors hover:scale-110 shadow"
          >
            <FaBookmark className="w-5 h-5" />
          </button> */}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 truncate line-clamp-1 max-w-full" title={producto.nombre}>{producto.nombre}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{producto.descripcion}</p>
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
          {/* <button 
            onClick={() => {
              // Lógica para añadir al carrito
            }}
            className="bg-purple-100 text-purple-600 p-3 rounded-full hover:bg-purple-200 transition-all duration-300 hover:scale-110 shadow"
          >
            <FaShoppingCart className="w-5 h-5" />
          </button> */}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className={`text-white max-w-2xl transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-xl">
              Tu Comunidad de Videojuegos
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-200 font-medium drop-shadow">
              Descubre juegos clásicos, lee artículos y comparte tu pasión por los CRPGs
            </p>
            <div className="flex gap-4">
              <a 
                href="/tienda"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Explorar ahora
                <FaArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="/blog"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 backdrop-blur-sm shadow-lg"
              >
                Leer artículos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Slider de Productos */}
      <Slider
        items={productos.slice(0, 5)}
        renderItem={renderProducto}
        title="Productos Destacados"
        subtitle="Descubre nuestra selección de juegos clásicos"
      />

      {/* Artículos Destacados */}
      <section className={`py-20 bg-gray-50 transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 drop-shadow-lg">
              Artículos Destacados
            </h2>
            <p className="text-gray-600 text-lg">Las últimas novedades y análisis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articulos.slice(0, 3).map((articulo, index) => (
              <div
                key={articulo.id}
                className={`bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 transition-all duration-1000 delay-${(index + 1) * 200} ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="relative h-48 bg-gray-200 group">
                  <img
                    src={articulo.imagen}
                    alt={articulo.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* <button 
                      onClick={() => {
                        // Lógica para dar like
                      }}
                      className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors hover:scale-110 shadow"
                    >
                      <FaHeart className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        // Lógica para guardar
                      }}
                      className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-yellow-500 transition-colors hover:scale-110 shadow"
                    >
                      <FaBookmark className="w-5 h-5" />
                    </button> */}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 truncate" title={articulo.titulo}>{articulo.titulo}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{articulo.descripcion}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Por {articulo.autor} • {new Date(articulo.fecha_publicacion).toLocaleDateString()}
                    </div>
                  </div>
                  <a
                    href={`/articulo/${articulo.id}`}
                    className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold shadow"
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