import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSave, FaImage, FaTimes, FaTrash } from 'react-icons/fa';
import { apiManager } from '../utils/apiManager';

const EditProductModal = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'juego',
    estado: 'nuevo',
    imagenes: []
  });
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  // Para cerrar al hacer click fuera
  const modalRef = React.useRef();

  const NAME_LIMIT = 100;
  const DESC_LIMIT = 300;
  const MAX_IMAGES = 5;
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        precio: initialData.precio ?? '',
        stock: initialData.stock ?? '',
        categoria: initialData.categoria || 'juego',
        estado: initialData.estado || 'nuevo',
        imagenes: []
      });
      // Si hay imágenes existentes, las mostramos como previsualizaciones
      if (initialData.imagenes && Array.isArray(initialData.imagenes)) {
        setPreviewImages(initialData.imagenes.map(url => ({ url, name: url.split('/').pop() })));
      } else if (initialData.imagen) {
        setPreviewImages([{ url: initialData.imagen, name: initialData.imagen.split('/').pop() }]);
      }
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
  }, [open, onClose]);  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para el campo stock
    if (name === 'stock') {
      // Permitir campo vacío o números enteros (incluyendo 0 temporalmente durante escritura)
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Verificar si excedemos el límite de imágenes
    if (formData.imagenes.length + files.length > MAX_IMAGES) {
      alert(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes`);
      return;
    }

    // Verificar duplicados
    const newFiles = files.filter(file => {
      return !formData.imagenes.some(existingFile => 
        existingFile.name === file.name && 
        existingFile.size === file.size
      );
    });

    if (newFiles.length !== files.length) {
      alert('Se han ignorado algunas imágenes duplicadas');
    }

    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...newFiles]
    }));

    // Crear previsualizaciones
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, {
          url: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };  const handleSubmit = async (e) => {
    e.preventDefault();
      // Validación del stock antes de enviar
    if (!formData.stock || parseInt(formData.stock) < 1) {
      alert('La cantidad debe ser al menos 1 unidad');
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Añadir todos los campos básicos
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('estado', formData.estado);
      
      // Añadir las imágenes nuevas si hay
      if (formData.imagenes && formData.imagenes.length > 0) {
        formData.imagenes.forEach(imagen => {
          formDataToSend.append('imagenes', imagen);
        });
      } else {
        // Si no hay imágenes nuevas, mantener las existentes
        if (initialData.imagenes && Array.isArray(initialData.imagenes)) {
          initialData.imagenes.forEach(url => {
            formDataToSend.append('imagenes_existentes', url);
          });
        } else if (initialData.imagen) {
          formDataToSend.append('imagenes_existentes', initialData.imagen);
        }
      }      const updatedProduct = await apiManager.put(`/productos/${formData.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });      onSave(updatedProduct);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={handleOverlayClick}
      ></div>
      
      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto relative transition-all duration-300 z-10"
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
        <form onSubmit={handleSubmit} className="space-y-6">          {/* Nombre */}
          <div>
            <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
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
          </div>          {/* Descripción */}
          <div>
            <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
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
          </div>          {/* Precio */}
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
          </div>          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad disponible</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: 5"
            />
            <div className="mt-1 text-sm text-gray-600">
              <p>💡 <strong>Información:</strong> Las compras reducen automáticamente el stock disponible.</p>
              <p>Puedes aumentar el stock aquí si tienes más unidades disponibles.</p>
            </div>
            {formData.stock && parseInt(formData.stock) < 1 && (
              <p className="text-red-500 text-sm mt-1">La cantidad debe ser al menos 1 unidad</p>
            )}
            {initialData && initialData.stock !== undefined && formData.stock && parseInt(formData.stock) !== parseInt(initialData.stock) && (
              <p className="text-blue-600 text-sm mt-1">
                📝 Cambiarás el stock de {initialData.stock} a {formData.stock} unidades
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="juego">Juego</option>
              <option value="consola">Consola</option>
              <option value="accesorio">Accesorio</option>
              <option value="merchandising">Merchandising</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="nuevo">Nuevo</option>
              <option value="como_nuevo">Como nuevo</option>
              <option value="bueno">Bueno</option>
              <option value="aceptable">Aceptable</option>
            </select>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto ({previewImages.length}/{MAX_IMAGES})
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 transition-colors duration-300">
              <div className="space-y-1 text-center">
                {previewImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {previewImages.length < MAX_IMAGES && (
                      <div className="h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <label className="cursor-pointer">
                          <FaImage className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Añadir más
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                            multiple
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="imagenes"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Subir imágenes</span>
                        <input
                          id="imagenes"
                          name="imagenes"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                          multiple
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hasta 10MB (máximo {MAX_IMAGES} imágenes)
                    </p>
                  </div>
                )}
              </div>
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
            </button>          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default EditProductModal; 