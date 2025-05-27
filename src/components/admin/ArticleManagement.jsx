import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import AdminDeleteModal from './AdminDeleteModal';

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState(null);
  const [deleteArticle, setDeleteArticle] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editArticle, setEditArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://127.0.0.1:8000/admin/articles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener artículos');
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = (article) => {
    setDeleteArticle(article);
  };

  const confirmDeleteArticle = async () => {
    if (!deleteArticle) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/admin/articles/${deleteArticle.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al eliminar artículo');
      }
      setArticles(articles.filter(article => article.id !== deleteArticle.id));
      setDeleteArticle(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Normaliza cada artículo para que tenga la estructura de Firestore
  const normalizeArticle = (article) => {
    if (!article || typeof article !== 'object') return null;
    // Si el artículo está anidado, desanídalo
    const keys = Object.keys(article);
    if (keys.length === 2 && keys[0] === 'id') {
      const inner = article[keys[1]];
      if (inner && typeof inner === 'object') {
        article = { id: article.id, ...inner };
      }
    }
    // Estructura exacta esperada
    return {
      id: typeof article.id === 'string' ? article.id : '',
      titulo: typeof article.titulo === 'string' ? article.titulo : '',
      descripcion: typeof article.descripcion === 'string' ? article.descripcion : '',
      contenido: typeof article.contenido === 'string' ? article.contenido : '',
      autor: typeof article.autor === 'string' ? article.autor : '',
      autor_email: typeof article.autor_email === 'string' ? article.autor_email : '',
      categoria: typeof article.categoria === 'string' ? article.categoria : '',
      fecha_publicacion: typeof article.fecha_publicacion === 'string' ? article.fecha_publicacion : '',
      imagen: typeof article.imagen === 'string' ? article.imagen : '',
      likes: typeof article.likes === 'number' ? article.likes : 0,
      ...article
    };
  };

  // Solo artículos válidos y bien formateados
  const normalizedArticles = articles
    .map(normalizeArticle)
    .filter(
      (article) =>
        article &&
        typeof article.titulo === 'string' &&
        article.titulo.length > 0 &&
        typeof article.contenido === 'string'
    );

  const filteredArticles = normalizedArticles.filter(article =>
    article.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortBy('');
      setSortOrder(null);
    } else {
      setSortOrder('asc');
    }
  };

  let sortedArticles = [...filteredArticles];
  if (sortBy && sortOrder) {
    sortedArticles.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    sortedArticles = filteredArticles;
  }

  const handleAddArticle = () => setShowAdd(true);
  const handleEditArticle = (article) => setEditArticle(article);

  const handleCreateArticle = async (form) => {
    try {
      // Aquí irá la llamada al endpoint correcto (luego se ajusta)
      // Por ahora solo actualiza el estado local para pruebas visuales
      const fakeId = Math.random().toString(36).substring(2, 10);
      setArticles([...articles, { ...form, id: fakeId }]);
      setShowAdd(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateArticle = async (form) => {
    try {
      // Aquí irá la llamada al endpoint correcto (luego se ajusta)
      setArticles(articles.map(a => a.id === editArticle.id ? { ...editArticle, ...form } : a));
      setEditArticle(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Artículos</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button onClick={handleAddArticle} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FaPlus />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('titulo')}>
                Artículo
                {sortBy === 'titulo' && sortOrder === 'asc' && <FaSortUp className="inline ml-1" />}
                {sortBy === 'titulo' && sortOrder === 'desc' && <FaSortDown className="inline ml-1" />}
                {sortBy !== 'titulo' && <FaSortUp className="inline ml-1 opacity-20" />}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('autor')}>
                Autor
                {sortBy === 'autor' && sortOrder === 'asc' && <FaSortUp className="inline ml-1" />}
                {sortBy === 'autor' && sortOrder === 'desc' && <FaSortDown className="inline ml-1" />}
                {sortBy !== 'autor' && <FaSortUp className="inline ml-1 opacity-20" />}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('fecha_publicacion')}>
                Fecha
                {sortBy === 'fecha_publicacion' && sortOrder === 'asc' && <FaSortUp className="inline ml-1" />}
                {sortBy === 'fecha_publicacion' && sortOrder === 'desc' && <FaSortDown className="inline ml-1" />}
                {sortBy !== 'fecha_publicacion' && <FaSortUp className="inline ml-1 opacity-20" />}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedArticles.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {article.imagen ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={article.imagen}
                          alt={article.titulo}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">
                            {typeof article.titulo === 'string' && article.titulo.length > 0
                              ? article.titulo[0].toUpperCase()
                              : '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {article.titulo}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {article.descripcion?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{article.autor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {article.fecha_publicacion ? new Date(article.fecha_publicacion).toLocaleDateString('es-ES') : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteArticle(article)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-4"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminDeleteModal
        isOpen={!!deleteArticle}
        onClose={() => setDeleteArticle(null)}
        onConfirm={confirmDeleteArticle}
        title="¿Eliminar artículo?"
        message="¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer."
        itemName={deleteArticle?.titulo}
      />
      <ArticleFormModal
        isOpen={!!editArticle}
        onClose={() => setEditArticle(null)}
        onSubmit={handleUpdateArticle}
        initialData={editArticle}
        mode="edit"
      />
      <ArticleFormModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleCreateArticle}
        mode="add"
      />
    </div>
  );
};

// Modal para añadir/editar artículo
const ArticleFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [form, setForm] = React.useState({
    titulo: initialData?.titulo || '',
    descripcion: initialData?.descripcion || '',
    contenido: initialData?.contenido || '',
    categoria: initialData?.categoria || '',
  });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setForm({
      titulo: initialData?.titulo || '',
      descripcion: initialData?.descripcion || '',
      contenido: initialData?.contenido || '',
      categoria: initialData?.categoria || '',
    });
    setError('');
  }, [isOpen, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion || !form.contenido || !form.categoria) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');
    await onSubmit(form);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{mode === 'edit' ? 'Editar artículo' : 'Añadir artículo'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea name="contenido" value={form.contenido} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Selecciona una categoría</option>
              <option value="noticia">noticia</option>
              <option value="reseña">reseña</option>
              <option value="analisis">analisis</option>
              <option value="guia">guia</option>
            </select>
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">{mode === 'edit' ? 'Guardar' : 'Añadir'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleManagement; 