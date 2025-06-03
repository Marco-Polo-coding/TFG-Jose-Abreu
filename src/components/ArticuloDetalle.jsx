import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaArrowLeft, FaComment, FaHome, FaSpinner } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Comments from './Comments';
import Toast from './Toast';
import { apiManager } from '../utils/apiManager';

const ArticuloDetalle = ({ id }) => {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const data = await apiManager.get(`/articulos/${id}`);
        setArticulo(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el artículo:", error);
        setLoading(false);
      }
    };
    
    fetchArticulo();
    checkIfArticleIsSaved();
  }, [id]);

  const checkIfArticleIsSaved = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const data = await apiManager.get(`/usuarios/email/${userEmail}`);
      setIsSaved(data.some(article => article.id === id));
    } catch (error) {
      console.error('Error checking if article is saved:', error);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setToastMessage('Debes iniciar sesión para guardar artículos');
        setToastType('error');
        setShowToast(true);
        return;
      }

      if (isSaved) {
        await apiManager.delete(`/usuarios/${userEmail}/articulos-guardados/${id}`);
        setIsSaved(false);
        setToastMessage('Artículo eliminado de guardados');
      } else {
        await apiManager.post(`/usuarios/${userEmail}/articulos-guardados/${id}`);
        setIsSaved(true);
        setToastMessage('Artículo guardado correctamente');
      }
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al guardar el artículo');
      setToastType('error');
      setShowToast(true);
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
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-xl truncate" title={articulo.titulo}>{articulo.titulo}</h1>
            <div className="flex items-center gap-4 text-purple-200">
              <a 
                href={`/user/${articulo.autor_email}`}
                className="hover:text-white transition-colors"
              >
                Por {articulo.autor}
              </a>
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
                <Comments articuloId={id} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast de notificación */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ArticuloDetalle;