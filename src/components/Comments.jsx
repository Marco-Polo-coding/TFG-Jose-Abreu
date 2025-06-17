import React, { useState, useEffect } from 'react';
import { FaComment, FaReply, FaTrash } from 'react-icons/fa';
import Toast from './Toast';
import ImageUpload from './ImageUpload';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';
import ConfirmDeleteCommentModal from './ConfirmDeleteCommentModal';

const Comments = ({ articuloId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respuestaComentario, setRespuestaComentario] = useState('');
  const [comentarioRespondiendo, setComentarioRespondiendo] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');  const [loading, setLoading] = useState(true);
  const [imagenComentario, setImagenComentario] = useState(null);
  const [imagenRespuesta, setImagenRespuesta] = useState(null);
  const user = authManager.getUser();
  const userEmail = user?.email;
  const [modalDelete, setModalDelete] = useState({ open: false, type: null, comentarioId: null, respuestaId: null });

  useEffect(() => {
    cargarComentarios();
  }, [articuloId]);
  const cargarComentarios = async () => {
    try {
      const data = await apiManager.get(`/articulos/${articuloId}/comentarios`);
      setComentarios(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      showNotification('Error al cargar los comentarios', 'error');
      setLoading(false);
    }
  };const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };
  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    
    // Verificar si el usuario está autenticado PRIMERO
    const user = authManager.getUser();
    if (!user || !authManager.isAuthenticated()) {
      showNotification('Debes iniciar sesión para publicar comentarios', 'error');
      return;
    }
    
    if (!nuevoComentario.trim()) {
      showNotification('El comentario no puede estar vacío', 'warning');
      return;
    }

    try {
      const userEmail = user.email;

      const formData = new FormData();
      formData.append('usuario', userEmail);
      formData.append('texto', nuevoComentario);
      formData.append('fecha', new Date().toISOString());
      if (imagenComentario) {
        formData.append('imagen', imagenComentario);
      }

      await apiManager.post(`/articulos/${articuloId}/comentarios`, formData);
      
      setNuevoComentario('');
      setImagenComentario(null);
      await cargarComentarios();
      showNotification('Comentario publicado correctamente', 'success');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      showNotification('Error al publicar el comentario. Inténtalo de nuevo.', 'error');
    }
  };  const handleSubmitRespuesta = async (e) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado PRIMERO
    const user = authManager.getUser();
    if (!user || !authManager.isAuthenticated()) {
      showNotification('Debes iniciar sesión para responder comentarios', 'error');
      return;
    }

    if (!respuestaComentario.trim()) {
      showNotification('La respuesta no puede estar vacía', 'warning');
      return;
    }

    try {
      const userEmail = user.email;

      const formData = new FormData();
      formData.append('usuario', userEmail);
      formData.append('texto', respuestaComentario);
      formData.append('fecha', new Date().toISOString());
      formData.append('comentario_padre', comentarioRespondiendo.id);
      if (imagenRespuesta) {
        formData.append('imagen', imagenRespuesta);
      }

      await apiManager.post(`/articulos/${articuloId}/comentarios`, formData);

      setRespuestaComentario('');
      setImagenRespuesta(null);
      setComentarioRespondiendo(null);
      await cargarComentarios();
      showNotification('Respuesta publicada correctamente', 'success');
    } catch (error) {
      console.error('Error al publicar respuesta:', error);
      showNotification('Error al publicar la respuesta. Inténtalo de nuevo.', 'error');
    }
  };

  const openDeleteComentario = (comentarioId) => {
    setModalDelete({ open: true, type: 'comentario', comentarioId, respuestaId: null });
  };
  const openDeleteRespuesta = (comentarioId, respuestaId) => {
    setModalDelete({ open: true, type: 'respuesta', comentarioId, respuestaId });
  };
  const closeModalDelete = () => setModalDelete({ open: false, type: null, comentarioId: null, respuestaId: null });

  const handleDeleteComentario = async () => {
    const { comentarioId } = modalDelete;
    try {
      await apiManager.delete(`/articulos/${articuloId}/comentarios/${comentarioId}?usuario=${userEmail}`);
      cargarComentarios();
      setToastMessage('Comentario eliminado correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al eliminar el comentario');
      setToastType('error');
      setShowToast(true);
    }
    closeModalDelete();
  };
  const handleDeleteRespuesta = async () => {
    const { comentarioId, respuestaId } = modalDelete;
    try {
      await apiManager.delete(`/articulos/${articuloId}/comentarios/${comentarioId}/respuestas/${respuestaId}?usuario=${userEmail}`);
      cargarComentarios();
      setToastMessage('Respuesta eliminada correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al eliminar la respuesta');
      setToastType('error');
      setShowToast(true);
    }
    closeModalDelete();
  };

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaComment className="w-6 h-6 text-purple-600" />
        Comentarios
      </h2>      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmitComentario} className="mb-8">
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe un comentario..."
          className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="4"
        />
        <div className="flex items-center gap-4 mb-4">
          <ImageUpload
            value={imagenComentario}
            onImageSelect={(file) => {
              const user = authManager.getUser();
              if (!user || !authManager.isAuthenticated()) {
                showNotification('Debes iniciar sesión para añadir imágenes', 'error');
                return;
              }
              setImagenComentario(file);
            }}
            onImageRemove={() => setImagenComentario(null)}
          />
        </div>
        <button
          type="submit"
          className="px-8 py-3 rounded-full transition-all duration-300 font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-105"
        >
          Publicar Comentario
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <a 
                href={`/user/${comentario.usuario}`}
                className="font-semibold text-purple-900 hover:text-purple-700 transition-colors"
              >
                {comentario.usuario}
              </a>
              <span className="text-gray-500">
                {new Date(comentario.fecha).toLocaleDateString()}
              </span>
              {comentario.usuario === userEmail && (
                <button
                  onClick={() => openDeleteComentario(comentario.id)}
                  className="ml-auto text-red-500 hover:text-red-700"
                  title="Eliminar comentario"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <p className="text-gray-700">{comentario.texto}</p>
            {comentario.imagen && (
              <div className="mt-2">
                <img
                  src={comentario.imagen}
                  alt="Comentario"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}            {/* Botón de responder */}
            <button
              onClick={() => {
                const user = authManager.getUser();
                if (!user || !authManager.isAuthenticated()) {
                  showNotification('Debes iniciar sesión para responder comentarios', 'error');
                  return;
                }
                setComentarioRespondiendo(comentario);
              }}
              className="mt-2 text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FaReply className="w-4 h-4" />
              Responder
            </button>            {/* Formulario de respuesta */}
            {comentarioRespondiendo?.id === comentario.id && (
              <form onSubmit={handleSubmitRespuesta} className="mt-4">
                <textarea
                  value={respuestaComentario}
                  onChange={(e) => setRespuestaComentario(e.target.value)}
                  placeholder="Escribe una respuesta..."
                  className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
                <div className="flex items-center gap-4 mb-4">
                  <ImageUpload
                    value={imagenRespuesta}
                    onImageSelect={(file) => {
                      const user = authManager.getUser();
                      if (!user || !authManager.isAuthenticated()) {
                        showNotification('Debes iniciar sesión para añadir imágenes', 'error');
                        return;
                      }
                      setImagenRespuesta(file);
                    }}
                    onImageRemove={() => setImagenRespuesta(null)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Publicar Respuesta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComentarioRespondiendo(null);
                      setRespuestaComentario('');
                      setImagenRespuesta(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
            
            {/* Respuestas */}
            {comentario.respuestas?.map((respuesta) => (
              <div key={respuesta.id} className="ml-8 mt-4 border-l-2 border-purple-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <a 
                    href={`/user/${respuesta.usuario}`}
                    className="font-semibold text-purple-900 hover:text-purple-700 transition-colors"
                  >
                    {respuesta.usuario}
                  </a>
                  <span className="text-gray-500">
                    {new Date(respuesta.fecha).toLocaleDateString()}
                  </span>
                  {respuesta.usuario === userEmail && (
                    <button
                      onClick={() => openDeleteRespuesta(comentario.id, respuesta.id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                      title="Eliminar respuesta"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{respuesta.texto}</p>
                {respuesta.imagen && (
                  <div className="mt-2">
                    <img
                      src={respuesta.imagen}
                      alt="Respuesta"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Toast de notificación */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteCommentModal
        isOpen={modalDelete.open}
        onClose={closeModalDelete}
        onConfirm={modalDelete.type === 'comentario' ? handleDeleteComentario : handleDeleteRespuesta}
      />
    </div>
  );
};

export default Comments; 