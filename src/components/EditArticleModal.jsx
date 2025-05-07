import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';
import Notification from './Notification';

const EditArticleModal = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [previewImage, setPreviewImage] = useState(initialData.imagen || null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const modalRef = useRef(null);

  const TITLE_LIMIT = 100;
  const DESC_LIMIT = 300;
  const CONTENT_LIMIT = 500;

  // Sincroniza los datos del artículo cada vez que cambia initialData o se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({ ...initialData });
      setPreviewImage(initialData.imagen || null);
    }
  }, [open, initialData]);

  useEffect(() => {
    // Cerrar modal al pulsar Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, () => setLoading(false));
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al guardar los cambios. Por favor, intenta de nuevo.'
      });
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Verificar si hay cambios sin guardar
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    if (hasChanges) {
      setNotification({
        type: 'warning',
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?'
      });
    }
    onClose();
  };

  // Cerrar modal al hacer clic fuera
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto py-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef} 
        className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-lg mx-2 sm:mx-4 my-8 animate-fade-in relative border border-gray-200"
        style={{ maxHeight: '95vh', minHeight: 'auto' }}
      >
        {/* Header fijo */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pb-3 border-b z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Editar Artículo</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(95vh - 10rem)' }}>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                Título
                <span className="text-xs text-gray-500">{(formData.titulo || '').length}/{TITLE_LIMIT}</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo || ''}
                onChange={e => {
                  if (e.target.value.length <= TITLE_LIMIT) handleChange(e);
                }}
                required
                maxLength={TITLE_LIMIT}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                Descripción
                <span className="text-xs text-gray-500">{(formData.descripcion || '').length}/{DESC_LIMIT}</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={e => {
                  if (e.target.value.length <= DESC_LIMIT) handleChange(e);
                }}
                required
                maxLength={DESC_LIMIT}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {previewImage ? (
                  <div className="space-y-1 text-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="imagen-articulo"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Cambiar imagen</span>
                        <input
                          id="imagen-articulo"
                          name="imagen"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="imagen-articulo"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Subir una imagen</span>
                        <input
                          id="imagen-articulo"
                          name="imagen"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                Contenido
                <span className="text-xs text-gray-500">{(formData.contenido || '').length}/{CONTENT_LIMIT}</span>
              </label>
              <textarea
                name="contenido"
                value={formData.contenido || ''}
                onChange={e => {
                  if (e.target.value.length <= CONTENT_LIMIT) handleChange(e);
                }}
                required
                maxLength={CONTENT_LIMIT}
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {/* Footer fijo */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
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

export default EditArticleModal; 