import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaArrowLeft, FaComment, FaHome } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';

const ArticuloDetalle = ({ id }) => {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/articulos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArticulo(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el artículo:", error);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitComentario = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el comentario
    console.log("Nuevo comentario:", nuevoComentario);
    setNuevoComentario("");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!articulo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Artículo no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar el artículo que buscas.
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
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      
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
                href="/blog"
                className="text-white hover:text-purple-200 transition-colors"
              >
                Blog
              </a>
              <span className="text-white/50">/</span>
              <span className="text-white/50">{articulo.titulo}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {articulo.titulo}
            </h1>
            <div className="flex items-center gap-4 text-purple-200">
              <span>Por {articulo.autor}</span>
              <span>•</span>
              <span>{new Date(articulo.fecha_publicacion).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido del Artículo */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del Artículo */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <img
                src={articulo.imagen}
                alt={articulo.titulo}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

            {/* Contenido y Comentarios */}
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="prose max-w-none mb-8">
                {articulo.contenido}
              </div>

              {/* Sección de Comentarios */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaComment className="w-6 h-6 text-purple-600" />
                  Comentarios
                </h2>
                
                <form onSubmit={handleSubmitComentario} className="mb-8">
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="4"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 hover:scale-105"
                  >
                    Publicar Comentario
                  </button>
                </form>

                <div className="space-y-6">
                  {articulo.comentarios?.map((comentario) => (
                    <div key={comentario.id} className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-purple-900">{comentario.usuario}</span>
                        <span className="text-gray-500">
                          {new Date(comentario.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comentario.texto}</p>
                      
                      {/* Respuestas */}
                      {comentario.respuestas?.map((respuesta) => (
                        <div key={respuesta.id} className="ml-8 mt-4 border-l-2 border-purple-200 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-purple-900">{respuesta.usuario}</span>
                            <span className="text-gray-500">
                              {new Date(respuesta.fecha).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{respuesta.texto}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticuloDetalle;