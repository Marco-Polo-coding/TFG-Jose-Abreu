import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaEdit, FaTrash, FaPlus, FaSpinner, FaHome } from 'react-icons/fa';
import axios from 'axios';
import CartButton from './CartButton';
import UserButton from './UserButton';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditArticleModal from './EditArticleModal';
import Notification from './Notification';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useLoadingState();
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setError('No se ha encontrado el email del usuario. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }
    fetchArticles(userEmail);
  }, []);

  const fetchArticles = async (userEmail) => {
    try {
      setLoading(true);
      if (!userEmail) {
        throw new Error('No se ha encontrado el email del usuario');
      }
      const response = await axios.get(`http://localhost:8000/articulos`);
      // Filtrar artículos por autor_email
      const filtered = response.data.filter(a => a.autor_email === userEmail);
      setArticles(filtered);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los artículos. Por favor, intenta de nuevo.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar artículo
  const handleDelete = async () => {
    if (!articleToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/articulos/${articleToDelete.id}`);
      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      setModalOpen(false);
      setArticleToDelete(null);
      setNotification({
        type: 'success',
        message: 'Artículo eliminado correctamente'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error al eliminar el artículo. Por favor, intenta de nuevo.'
      });
      console.error('Error deleting article:', err);
    }
  };

  // Guardar cambios de edición
  const handleEditSave = async (formData, stopLoading) => {
    try {
      let updatedArticle = { ...formData };
      // Siempre usa FormData, aunque no haya imagen
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion || '');
      data.append('contenido', formData.contenido);
      data.append('categoria', formData.categoria || 'reseña');
      data.append('autor', formData.autor || '');
      data.append('autor_email', formData.autor_email || '');
      if (formData.imagen instanceof File) {
        data.append('imagen', formData.imagen);
      }
      const response = await axios.put(
        `http://localhost:8000/articulos/${formData.id}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      updatedArticle = response.data;
      setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
      setEditModalOpen(false);
      setArticleToEdit(null);
      setNotification({
        type: 'success',
        message: 'Artículo actualizado correctamente'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error al guardar los cambios. Por favor, intenta de nuevo.'
      });
      console.error('Error editing article:', err);
    } finally {
      stopLoading();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botones flotantes de usuario y carrito */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Hero Section */}
      <section className="relative h-[30vh] bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center mb-12 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-4">
            <a href="/" className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors">
              <FaHome className="w-5 h-5" />
              <span>Inicio</span>
            </a>
            <span className="text-white/50">/</span>
            <span className="text-white/50">Mis Artículos</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <FaNewspaper className="text-5xl md:text-6xl drop-shadow-xl" />
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 drop-shadow-xl">Mis Artículos</h1>
              <p className="text-lg md:text-xl text-gray-200 drop-shadow">Gestiona tus artículos publicados en el blog</p>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaNewspaper className="text-purple-500" />
            Tus artículos
          </h2>
          <a
            href="/post_article"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
          >
            <FaPlus />
            Nuevo Artículo
          </a>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-purple-500" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <FaNewspaper className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tienes artículos publicados aún.</p>
            <a 
              href="/post_article"
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              ¡Publica tu primer artículo!
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map(article => (
              <div key={article.id} className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60 animate-fade-in">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img 
                    src={article.imagen && article.imagen !== '/default-article.jpg' ? article.imagen : 'https://cataas.com/cat'} 
                    alt={article.titulo}
                    className="object-cover rounded-xl w-full h-48"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate max-w-[180px]">{article.titulo}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{article.contenido?.slice(0, 100)}...</p>
                <p className="text-purple-700 font-extrabold mb-4 text-lg">{new Date(article.fecha_publicacion).toLocaleDateString()}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar artículo"
                    onClick={() => { setArticleToEdit(article); setEditModalOpen(true); }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar artículo"
                    onClick={() => { setArticleToDelete(article); setModalOpen(true); }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setArticleToDelete(null); }}
        onConfirm={handleDelete}
        articleTitle={articleToDelete?.titulo || ''}
      />
      {/* Modal de edición de artículo */}
      <EditArticleModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setArticleToEdit(null); }}
        onSave={handleEditSave}
        initialData={articleToEdit || {}}
      />
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

export default MyArticles; 