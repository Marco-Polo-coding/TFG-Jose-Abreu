import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Slider from './Slider';
import { apiManager } from '../utils/apiManager';

const HomePage = () => {
  const [productos, setProductos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({}); // { [productoId]: index }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (token && expiresAt) {
      const now = new Date();
      if (now > new Date(expiresAt)) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhoto');
        localStorage.removeItem('userBio');
        localStorage.removeItem('uid');
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosData, articulosData] = await Promise.all([
          apiManager.get('/productos'),
          apiManager.get('/articulos')
        ]);
        setProductos(productosData);
        setArticulos(articulosData);
        setLoading(false);
        setTimeout(() => {
          setShowContent(true);
        }, 100);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Email suscrito:", email);
    setEmail("");
  };

  // Funciones para el slider de imágenes por producto
  const handlePrevImage = (productoId, total) => {
    setImageIndexes(prev => ({
      ...prev,
      [productoId]: prev[productoId] > 0 ? prev[productoId] - 1 : total - 1
    }));
  };
  const handleNextImage = (productoId, total) => {
    setImageIndexes(prev => ({
      ...prev,
      [productoId]: prev[productoId] < total - 1 ? prev[productoId] + 1 : 0
    }));
  };

  const renderProducto = (producto) => {
    const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : ['https://cataas.com/cat'];
    const currentIndex = imageIndexes[producto.id] || 0;
    return (
      <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60">
        <div className="relative h-48 bg-gray-200 group flex items-center justify-center">
          <img
            src={imagenes[currentIndex]}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
          {imagenes.length > 1 && (
            <>
              <button
                onClick={() => handlePrevImage(producto.id, imagenes.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleNextImage(producto.id, imagenes.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
              >
                <FaChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {imagenes.map((_, idx) => (
                  <span key={idx} className={`w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-purple-600' : 'bg-gray-300'} inline-block`}></span>
                ))}
              </div>
            </>
          )}
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
  };

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

      {/* Footer */}
      <footer className={`bg-gray-900 text-white relative overflow-hidden transition-all duration-1000 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Columna 1 - Logo y Descripción */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/rpg-game.svg" alt="Logo" className="w-10 h-10" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">CRPG Hub</span>
              </div>
              <p className="text-gray-400">
                Tu comunidad de videojuegos clásicos. Descubre, comparte y disfruta de los mejores CRPGs.
              </p>
            </div>

            {/* Columna 2 - Enlaces Rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/tienda" className="text-gray-400 hover:text-purple-400 transition-colors">Tienda</a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a>
                </li>
                <li>
                  <a href="/profile" className="text-gray-400 hover:text-purple-400 transition-colors">Mi Perfil</a>
                </li>
                <li>
                  <a href="/favorite_products" className="text-gray-400 hover:text-purple-400 transition-colors">Favoritos</a>
                </li>
              </ul>
            </div>

            {/* Columna 3 - Categorías */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Categorías</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/tienda?categoria=rpg" className="text-gray-400 hover:text-purple-400 transition-colors">RPG</a>
                </li>
                <li>
                  <a href="/tienda?categoria=estrategia" className="text-gray-400 hover:text-purple-400 transition-colors">Estrategia</a>
                </li>
                <li>
                  <a href="/tienda?categoria=aventura" className="text-gray-400 hover:text-purple-400 transition-colors">Aventura</a>
                </li>
                <li>
                  <a href="/tienda?categoria=retro" className="text-gray-400 hover:text-purple-400 transition-colors">Retro</a>
                </li>
              </ul>
            </div>

            {/* Columna 4 - Contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  <span className="block">Email: info@crpghub.com</span>
                </li>
                <li className="text-gray-400">
                  <span className="block">Teléfono: +34 123 456 789</span>
                </li>
                <li className="text-gray-400">
                  <span className="block">Dirección: Madrid, España</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-gray-800 my-8"></div>

          {/* Copyright y Redes Sociales */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CRPG Hub. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 