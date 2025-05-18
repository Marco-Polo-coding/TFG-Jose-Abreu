import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaArrowLeft, FaComment, FaHome, FaSpinner } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import axios from 'axios';
import Notification from './Notification';

const ArticuloDetalle = ({ id }) => {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [notification, setNotification] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

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
    checkIfArticleIsSaved();
  }, [id]);

  const checkIfArticleIsSaved = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await axios.get(`http://localhost:8000/usuarios/${userEmail}/articulos-guardados`);
      const savedArticles = response.data;
      setIsSaved(savedArticles.some(article => article.id === id));
    } catch (error) {
      console.error('Error checking if article is saved:', error);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setNotification({
          type: 'error',
          message: 'Debes iniciar sesión para guardar artículos'
        });
        return;
      }

      setLoading(true);
      if (isSaved) {
        await axios.delete(`http://localhost:8000/usuarios/${userEmail}/articulos-guardados/${id}`);
        setIsSaved(false);
        setNotification({
          type: 'success',
          message: 'Artículo eliminado de guardados'
        });
      } else {
        await axios.post(`http://localhost:8000/usuarios/${userEmail}/articulos-guardados/${id}`);
        setIsSaved(true);
        setNotification({
          type: 'success',
          message: 'Artículo guardado correctamente'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al guardar el artículo'
      });
    } finally {
      setLoading(false);
    }
  };

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
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden">
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
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-xl">{articulo.titulo}</h1>
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
            <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 group animate-fade-in">
              <img
                src={articulo.imagen && articulo.imagen.startsWith('http') && articulo.imagen !== '/default-article.jpg' ? articulo.imagen : 'https://cataas.com/cat'}
                alt={articulo.titulo}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={handleSaveArticle}
                  disabled={loading}
                  className={`bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full text-white hover:text-yellow-200 transition-colors hover:scale-110 shadow-lg ${isSaved ? 'bg-yellow-500' : ''}`}
                  title={isSaved ? "Eliminar de guardados" : "Guardar artículo"}
                >
                  {loading ? (
                    <FaSpinner className="w-6 h-6 animate-spin" />
                  ) : (
                    <FaBookmark className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Contenido y Comentarios */}
            <div className="bg-white rounded-2xl shadow-2xl p-10 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">
              <div className="prose max-w-none mb-4">
                <p className="text-lg text-gray-700 mb-2 font-semibold">{articulo.descripcion}</p>
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">{articulo.categoria || 'Sin categoría'}</span>
                <div className="my-4" />
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
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold shadow-lg"
                  >
                    Publicar Comentario
                  </button>
                </form>

                <div className="space-y-6">
                  {articulo.comentarios?.map((comentario) => (
                    <div key={comentario.id} className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6">
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

      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ArticuloDetalle;