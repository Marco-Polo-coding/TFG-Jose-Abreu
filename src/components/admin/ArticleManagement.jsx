import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaPlus, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import AdminDeleteModal from './AdminDeleteModal';
import ReactDOM from 'react-dom';
import { apiManager } from '../../utils/apiManager';
import { authManager } from '../../utils/authManager';
import { showAdminToast } from './AdminToast';

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
  const [detalleArticulo, setDetalleArticulo] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);
  const fetchArticles = async () => {
    try {
      const data = await apiManager.get('/admin/articles');
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      let userFriendlyMessage = 'Error al cargar los artículos. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para ver esta información.';
      } else if (err.message.includes('500')) {
        userFriendlyMessage = 'Error del servidor. Por favor, contacta al administrador.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteArticle = (article) => {
    setDeleteArticle(article);
  };  const confirmDeleteArticle = async () => {
    if (!deleteArticle) return;
    try {
      await apiManager.delete(`/admin/articles/${deleteArticle.id}`);
      setArticles(prev => prev.filter(a => a.id !== deleteArticle.id));
      setDeleteArticle(null);
      showAdminToast(`Artículo "${deleteArticle.titulo}" eliminado correctamente`, 'success');
    } catch (err) {
      console.error('Error deleting article:', err);
      let userFriendlyMessage = 'Error al eliminar el artículo. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para eliminar este artículo.';
      } else if (err.message.includes('404')) {
        userFriendlyMessage = 'El artículo ya no existe o ha sido eliminado.';
      }
      
      showAdminToast(userFriendlyMessage, 'error');
      setDeleteArticle(null);
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
      const user = authManager.getUser();
      const userName = user?.name;
      const userEmail = user?.email;
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('contenido', form.contenido);
      formData.append('categoria', form.categoria);
      formData.append('autor', userName || '');
      formData.append('autor_email', userEmail || '');
      // No se envía imagen, el backend pone la de gato si no hay      const created = await apiManager.post('/articulos', formData);
      setArticles([...articles, created]);
      setShowAdd(false);
      showAdminToast(`Artículo "${form.titulo}" creado correctamente`, 'success');
    } catch (err) {
      showAdminToast(err.message || 'Error al crear el artículo. Por favor, intenta de nuevo.', 'error');
    }
  };  const handleUpdateArticle = async (form) => {
    try {
      console.log("Actualizando artículo:", editArticle.id);
      console.log("Datos del formulario:", form);
      
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('contenido', form.contenido);
      formData.append('categoria', form.categoria);
      
      // Mantener autor y autor_email - CORREGIDO
      if (editArticle.autor) {
        formData.append('autor', editArticle.autor);
      }
      
      if (editArticle.autor_email) {
        formData.append('autor_email', editArticle.autor_email);
      }
      
      // Conservar la imagen existente - CORREGIDO
      if (editArticle.imagen && typeof editArticle.imagen === 'string') {
        console.log("Enviando imagen existente:", editArticle.imagen);
        formData.append('imagen_existente', editArticle.imagen);
      }
      
      // Mantener otros campos importantes
      if (editArticle.fecha_publicacion) {
        formData.append('fecha_publicacion', editArticle.fecha_publicacion);
      }
      
      if (typeof editArticle.likes !== 'undefined') {
        formData.append('likes', editArticle.likes);
      }
      
      // Depuración para ver qué se está enviando al servidor
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      console.log("Enviando petición PUT a /articulos/" + editArticle.id);
      const updated = await apiManager.put(`/articulos/${editArticle.id}`, formData);
      console.log("Respuesta del servidor:", updated);
      
      setArticles(articles.map(a => a.id === editArticle.id ? updated : a));
      setEditArticle(null);
      showAdminToast(`Artículo "${form.titulo}" actualizado correctamente`, 'success');
    } catch (err) {
      console.error("Error al actualizar artículo:", err);
      let errorMessage = 'Error al actualizar el artículo. Por favor, intenta de nuevo.';
      
      if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (err.message?.includes('403')) {
        errorMessage = 'No tienes permisos para editar este artículo.';
      } else if (err.message?.includes('404')) {
        errorMessage = 'El artículo que intentas editar ya no existe.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Error interno del servidor. Contacta al administrador.';
      }
      
      showAdminToast(errorMessage, 'error');
    }
  };

  // Añadir función para el icono de ordenación
  const getSortIcon = (order) => {
    if (order === 'asc') return <FaSortUp className="inline ml-1 text-purple-400" />;
    if (order === 'desc') return <FaSortDown className="inline ml-1 text-purple-400" />;
    return <FaSort className="inline ml-1 text-gray-300" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in max-w-md">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-4" />
          <p className="text-lg font-semibold mb-2">No se pudieron cargar los artículos</p>
          <p className="text-sm text-red-600 mb-4 text-center">
            {error.includes('fetch') || error.includes('network') || error.includes('Failed to fetch')
              ? 'Error de conexión. Por favor, verifica tu conexión a internet.'
              : error.includes('401') || error.includes('unauthorized')
              ? 'No tienes permisos para ver esta información.'
              : error.includes('403') || error.includes('forbidden')
              ? 'Acceso denegado. Contacta al administrador.'
              : 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
          >
            Reintentar
          </button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('titulo')}>
                Artículo {getSortIcon(sortBy === 'titulo' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('autor')}>
                Autor {getSortIcon(sortBy === 'autor' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('fecha_publicacion')}>
                Fecha {getSortIcon(sortBy === 'fecha_publicacion' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedArticles.map((article) => (
              <tr key={article.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition cursor-pointer" onClick={e => { if (!e.target.closest('.acciones-btn')) setDetalleArticulo(article); }}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 acciones-btn">
                  <button
                    onClick={e => { e.stopPropagation(); setDetalleArticulo(article); }}
                    className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition"
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
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
      </div>      <AdminDeleteModal
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
      <AdminArticuloDetalleModal
        isOpen={!!detalleArticulo}
        onClose={() => setDetalleArticulo(null)}
        articulo={detalleArticulo}
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
    // Asegurarse de que el formulario se restablezca correctamente cuando cambia el initialData o se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setForm({
        titulo: initialData?.titulo || '',
        descripcion: initialData?.descripcion || '',
        contenido: initialData?.contenido || '',
        categoria: initialData?.categoria || '',
      });
      setError('');
      console.log("Formulario inicializado con:", initialData);
    }
  }, [isOpen, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validación mejorada
    if (!form.titulo || form.titulo.trim() === '') {
      setError('El título del artículo es obligatorio');
      return;
    }
    
    if (!form.descripcion || form.descripcion.trim() === '') {
      setError('La descripción es obligatoria');
      return;
    }
    
    if (!form.contenido || form.contenido.trim() === '') {
      setError('El contenido del artículo es obligatorio');
      return;
    }
    
    if (!form.categoria) {
      setError('Debes seleccionar una categoría');
      return;
    }
    
    setError('');
    console.log("Enviando formulario validado:", form);
    await onSubmit(form);
  };

  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleOverlayClick}></div>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in relative z-10">
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

// Modal de detalle de artículo
const AdminArticuloDetalleModal = ({ isOpen, onClose, articulo }) => {
  if (!isOpen || !articulo) return null;
  const inicial = articulo.titulo?.[0]?.toUpperCase() || '?';
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-purple-600 text-2xl font-bold" aria-label="Cerrar">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalle de Artículo</h2>
        <div className="flex flex-col items-center mb-4">
          {articulo.imagen ? (
            <img src={articulo.imagen} alt="Imagen del artículo" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <span className="text-4xl text-purple-600 font-bold">{inicial}</span>
            </div>
          )}
          <div className="text-lg font-semibold text-gray-800">{articulo.titulo}</div>
          <div className="text-sm text-gray-500">{articulo.categoria}</div>
        </div>
        <div className="text-left space-y-2 mb-4">
          <div><span className="font-semibold">Descripción:</span> {articulo.descripcion}</div>
          <div><span className="font-semibold">Contenido:</span> {articulo.contenido}</div>
          <div><span className="font-semibold">Autor:</span> {articulo.autor}</div>
          <div><span className="font-semibold">Email autor:</span> {articulo.autor_email}</div>
          <div><span className="font-semibold">Fecha publicación:</span> {articulo.fecha_publicacion ? new Date(articulo.fecha_publicacion).toLocaleString('es-ES') : '-'}</div>
          <div><span className="font-semibold">Likes:</span> {articulo.likes}</div>
          <div><span className="font-semibold">ID:</span> {articulo.id}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ArticleManagement; 