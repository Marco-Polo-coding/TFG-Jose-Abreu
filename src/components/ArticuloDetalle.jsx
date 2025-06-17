import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaArrowLeft, FaComment, FaHome, FaSpinner } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Comments from './Comments';
import Toast from './Toast';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';

const ArticuloDetalle = ({ id }) => {  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [savedArticles, setSavedArticles] = useState([]);

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
    fetchSavedArticles();
  }, [id]);  const fetchSavedArticles = async () => {
    try {
      const user = authManager.getUser();
      const userEmail = user?.email;
      if (!userEmail) return;

      const data = await apiManager.getSavedArticles(userEmail);
      setSavedArticles(data);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };  const handleSaveArticle = async () => {
    try {
      setIsSaving(true);
      const user = authManager.getUser();
      const userEmail = user?.email;
      
      if (!userEmail) {
        showNotification('Debes iniciar sesión para guardar artículos', 'error');
        return;
      }

      // Verificar si ya está en guardados
      const isSaved = savedArticles.some(article => article.id === articulo.id);
      
      if (isSaved) {
        await apiManager.removeSavedArticle(userEmail, id);
        setSavedArticles(prev => prev.filter(article => article.id !== articulo.id));
        showNotification('Artículo eliminado de guardados', 'success');
      } else {
        await apiManager.addSavedArticle(userEmail, id);
        setSavedArticles(prev => [...prev, articulo]);
        showNotification('Artículo guardado correctamente', 'success');
      }
    } catch (error) {
      showNotification('Error al guardar el artículo', 'error');
    } finally {
      setIsSaving(false);
    }
  };  const handleSubmitComentario = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el comentario
    setNuevoComentario("");
  };
  
  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
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
            {/* Imagen del Artículo */}            <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">
              <div className="relative group">
                <img
                  src={articulo.imagen && articulo.imagen.startsWith('http') && articulo.imagen !== '/default-article.jpg' ? articulo.imagen : 'https://cataas.com/cat'}
                  alt={articulo.titulo}
                  className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />              
                {(() => {
                  // Determinamos si el artículo está en guardados fuera del JSX para mayor claridad
                  const isSaved = savedArticles.some(article => article.id === articulo.id);
                  const isOwnArticle = articulo.autor_email === authManager.getUser()?.email;
                  
                  return (
                    <button
                      onClick={handleSaveArticle}
                      disabled={isSaving || isOwnArticle}
                      className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSaved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } ${
                        isOwnArticle
                          ? 'bg-gray-400' 
                          : isSaved
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      }`}
                      title={
                        isOwnArticle 
                          ? "No puedes guardar tu propio artículo" 
                          : isSaved 
                          ? "Eliminar de guardados" 
                          : "Guardar artículo"
                      }
                      style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.15)' }}
                    >
                      {isSaving ? (
                        <FaSpinner className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <FaBookmark className={`w-6 h-6 transition-colors duration-200 ${
                          isOwnArticle
                            ? 'text-gray-200'
                            : isSaved
                            ? 'text-white fill-current'
                            : 'text-white group-hover:text-yellow-200'
                        }`} />
                      )}
                    </button>
                  );
                })()}
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