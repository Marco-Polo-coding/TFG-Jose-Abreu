import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';

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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Botón flotante para crear artículo */}
      <a
        href="/post_article"
        className="fixed bottom-8 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group overflow-hidden"
        title="Crear nuevo artículo"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.25)', minWidth: '56px', height: '56px' }}
      >
        <span className="flex items-center justify-center w-14 h-14 text-3xl font-bold transition-all duration-300 group-hover:w-10 group-hover:mr-2">+</span>
        <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs group-hover:pl-2 transition-all duration-300 text-base font-semibold">Publicar un artículo</span>
      </a>
      
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
              <span className="text-white/50">Blog</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Blog de CRPGs
            </h1>
            <p className="text-xl md:text-2xl">
              Descubre artículos, reseñas y análisis de juegos clásicos
            </p>
          </div>
        </div>
      </section>

      {/* Artículos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {articulos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No hay artículos disponibles
              </h2>
              <p className="text-gray-600">
                Por ahora no tenemos artículos publicados. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articulos.map((articulo) => (
                <div
                  key={articulo.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-200 group">
                    <img
                      src={articulo.imagen}
                      alt={articulo.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {articulo.descripcion}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        Por {articulo.autor} • {new Date(articulo.fecha_publicacion).toLocaleDateString()}
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
      </section>
    </div>
  );
};

export default BlogPage;