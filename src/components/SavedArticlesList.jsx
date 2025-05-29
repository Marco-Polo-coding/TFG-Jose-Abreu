import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaBookmark, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';
import Toast from './Toast';

// Datos de ejemplo (reemplazar por fetch a la API en el futuro)
const savedArticles = [];
// Ejemplo de estructura:
// const savedArticles = [
//   { id: 1, titulo: 'Título del artículo', autor: 'Autor', fecha: '2024-03-15', imagen: '/ruta.jpg', descripcion: 'Resumen...' },
// ];

const SavedArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useLoadingState();
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('No se ha encontrado el email del usuario. Por favor, inicia sesión.');
        return;
      }
      const response = await axios.get(`http://localhost:8000/usuarios/${userEmail}/articulos-guardados`);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los artículos guardados. Por favor, intenta de nuevo.');
      console.error('Error fetching saved articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      setDeletingId(articleId);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setToastMessage('No se ha encontrado el email del usuario');
        setToastType('error');
        setShowToast(true);
        return;
      }

      await axios.delete(`http://localhost:8000/usuarios/${userEmail}/articulos-guardados/${articleId}`);
      setArticles(prev => prev.filter(article => article.id !== articleId));
      setToastMessage('Artículo eliminado de guardados');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al eliminar el artículo');
      setToastType('error');
      setShowToast(true);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!articles.length) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-full shadow-lg text-4xl">
            <FaBookmark />
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes artículos guardados</h2>
        <p className="text-gray-600 mb-6">Cuando guardes artículos, aparecerán aquí para que los leas cuando quieras.</p>
        <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
          Ir al blog <FaArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((articulo) => (
        <div key={articulo.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative h-48 bg-gray-200">
            <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDeleteArticle(articulo.id)}
                disabled={deletingId === articulo.id}
                className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors hover:scale-110 shadow"
                title="Eliminar de guardados"
              >
                {deletingId === articulo.id ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{articulo.descripcion}</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Por {articulo.autor} • {new Date(articulo.fecha_publicacion).toLocaleDateString()}
              </div>
            </div>
            <a href={`/articulo/${articulo.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold">
              Leer más <FaArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}

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

export default SavedArticlesList; 