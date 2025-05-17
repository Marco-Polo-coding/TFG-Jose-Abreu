import React, { useState, useEffect } from 'react';
import { FaImage, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';

const PostArticleForm = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    imagen: null,
    categoria: 'reseña'
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [initialLoading, setInitialLoading] = useLoadingState();

  const TITLE_LIMIT = 100;
  const DESC_LIMIT = 300;
  const CONTENT_LIMIT = 500;

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imagen') {
          if (formData[key]) {
            formDataToSend.append('imagen', formData[key]);
          }
          // Si no hay imagen, no añadas nada
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      // Añade el email y el nombre del usuario
      formDataToSend.append('autor_email', userEmail || '');
      formDataToSend.append('autor', userName || userEmail || 'Autor');

      const response = await fetch('http://localhost:8000/articulos', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        window.location.href = '/blog';
      } else {
        throw new Error('Error al publicar el artículo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar el artículo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
            Título del artículo
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={e => {
              if (e.target.value.length <= TITLE_LIMIT) handleChange(e);
            }}
            required
            maxLength={TITLE_LIMIT}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Escribe un título atractivo..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">{formData.titulo.length}/{TITLE_LIMIT}</div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción breve
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={e => {
              if (e.target.value.length <= DESC_LIMIT) handleChange(e);
            }}
            required
            maxLength={DESC_LIMIT}
            rows="3"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Una breve descripción de tu artículo..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">{formData.descripcion.length}/{DESC_LIMIT}</div>
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="reseña">Reseña</option>
            <option value="analisis">Análisis</option>
            <option value="noticia">Noticia</option>
            <option value="guia">Guía</option>
            <option value="opinion">Opinión</option>
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de portada
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 transition-colors duration-300">
            <div className="space-y-1 text-center">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mx-auto h-48 w-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, imagen: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imagen"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Subir una imagen</span>
                      <input
                        id="imagen"
                        name="imagen"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del artículo
          </label>
          <textarea
            id="contenido"
            name="contenido"
            value={formData.contenido}
            onChange={e => {
              if (e.target.value.length <= CONTENT_LIMIT) handleChange(e);
            }}
            required
            maxLength={CONTENT_LIMIT}
            rows="12"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Escribe tu artículo aquí..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">{formData.contenido.length}/{CONTENT_LIMIT}</div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Publicando...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2 h-5 w-5" />
                Publicar artículo
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostArticleForm; 