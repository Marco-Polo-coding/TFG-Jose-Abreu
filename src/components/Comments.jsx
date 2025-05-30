import React, { useState, useEffect } from 'react';
import { FaComment, FaReply } from 'react-icons/fa';
import Toast from './Toast';
import { apiManager } from '../utils/apiManager';

const Comments = ({ articuloId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respuestaComentario, setRespuestaComentario] = useState('');
  const [comentarioRespondiendo, setComentarioRespondiendo] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarComentarios();
  }, [articuloId]);

  const cargarComentarios = async () => {
    try {
      const data = await apiManager.get(`/articulos/${articuloId}/comentarios`);
      setComentarios(data);
      setLoading(false);
    } catch (error) {
      setToastMessage('Error al cargar los comentarios');
      setToastType('error');
      setShowToast(true);
      setLoading(false);
    }
  };

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setToastMessage('Debes iniciar sesión para comentar');
        setToastType('error');
        setShowToast(true);
        return;
      }

      const comentario = {
        usuario: userEmail,
        texto: nuevoComentario,
        fecha: new Date().toISOString()
      };

      await apiManager.post(`/articulos/${articuloId}/comentarios`, comentario);
      setNuevoComentario('');
      cargarComentarios();
      setToastMessage('Comentario publicado correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al publicar el comentario');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleSubmitRespuesta = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setToastMessage('Debes iniciar sesión para responder');
        setToastType('error');
        setShowToast(true);
        return;
      }

      const respuesta = {
        usuario: userEmail,
        texto: respuestaComentario,
        fecha: new Date().toISOString(),
        comentario_padre: comentarioRespondiendo.id
      };

      await apiManager.post(`/articulos/${articuloId}/comentarios`, respuesta);
      setRespuestaComentario('');
      setComentarioRespondiendo(null);
      cargarComentarios();
      setToastMessage('Respuesta publicada correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al publicar la respuesta');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaComment className="w-6 h-6 text-purple-600" />
        Comentarios
      </h2>

      {/* Formulario de nuevo comentario */}
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
            </div>
            <p className="text-gray-700">{comentario.texto}</p>
            
            {/* Botón de responder */}
            <button
              onClick={() => setComentarioRespondiendo(comentario)}
              className="mt-2 text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <FaReply className="w-4 h-4" />
              Responder
            </button>

            {/* Formulario de respuesta */}
            {comentarioRespondiendo?.id === comentario.id && (
              <form onSubmit={handleSubmitRespuesta} className="mt-4">
                <textarea
                  value={respuestaComentario}
                  onChange={(e) => setRespuestaComentario(e.target.value)}
                  placeholder="Escribe una respuesta..."
                  className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
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
                </div>
                <p className="text-gray-700">{respuesta.texto}</p>
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
    </div>
  );
};

export default Comments; 