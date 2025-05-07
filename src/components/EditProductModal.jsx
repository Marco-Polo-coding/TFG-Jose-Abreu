import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSave, FaImage, FaTimes } from 'react-icons/fa';

const EditProductModal = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'juegos',
    imagen: null
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Para cerrar al hacer click fuera
  const modalRef = React.useRef();

  const NAME_LIMIT = 100;
  const DESC_LIMIT = 300;

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        precio: initialData.precio || '',
        stock: initialData.stock || '',
        categoria: initialData.categoria || 'juegos',
        imagen: null
      });
      setPreviewImage(initialData.imagen || null);
    }
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

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
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imagen') {
          if (formData[key] instanceof File) {
            formDataToSend.append('imagen', formData[key]);
          }
        } else if (key !== 'id' && key !== 'stock') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`http://localhost:8000/productos/${formData.id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        onSave(updatedProduct);
      } else {
        throw new Error('Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto relative transition-all duration-300"
      >
        {/* Botón de cierre (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
              Nombre
              <span className="text-xs text-gray-500">{(formData.nombre || '').length}/{NAME_LIMIT}</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={e => {
                if (e.target.value.length <= NAME_LIMIT) handleChange(e);
              }}
              required
              maxLength={NAME_LIMIT}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
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

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="juegos">Juegos</option>
              <option value="accesorios">Accesorios</option>
              <option value="merchandising">Merchandising</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          {/* Imagen */}
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
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imagen"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Cambiar imagen</span>
                      <input
                        id="imagen"
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
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
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
  );
};

export default EditProductModal; 