import React, { useState, useEffect } from 'react';
import { FaImage, FaSpinner, FaPaperPlane, FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import { authManager } from '../utils/authManager';

const UploadProductForm = () => {
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
  const [initialLoading, setInitialLoading] = useState(true);

  const NAME_LIMIT = 100;
  const DESC_LIMIT = 300;
  const MAX_IMAGES = 5;

  useEffect(() => {
    // Simular una carga inicial rápida
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <LoadingSpinner />;
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para el campo stock
    if (name === 'stock') {
      // Solo permitir números enteros positivos
      if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1)) {
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
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación del stock antes de enviar
    if (!formData.stock || parseInt(formData.stock) < 1) {
      alert('La cantidad debe ser al menos 1 unidad');
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imagenes') {
          formData.imagenes.forEach(imagen => {
            formDataToSend.append('imagenes', imagen);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      const user = authManager.getUser();
      const userEmail = user?.email;
      if (userEmail) {
        formDataToSend.append('usuario_email', userEmail);
      }
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const response = await fetch('http://localhost:8000/productos', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        window.location.href = '/tienda';
      } else {
        throw new Error('Error al subir el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del producto
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={e => {
              if (e.target.value.length <= NAME_LIMIT) handleChange(e);
            }}
            required
            maxLength={NAME_LIMIT}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Escribe el nombre del producto..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">{formData.nombre.length}/{NAME_LIMIT}</div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
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
            placeholder="Describe el producto..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">{formData.descripcion.length}/{DESC_LIMIT}</div>
        </div>        {/* Precio */}
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
            Precio (€)
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="0.00"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Cantidad"
          />
          {formData.stock && parseInt(formData.stock) < 1 && (
            <div className="text-xs text-red-500 mt-1">La cantidad debe ser al menos 1 unidad</div>
          )}
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
            <option value="juego">Juego</option>
            <option value="consola">Consola</option>
            <option value="accesorio">Accesorio</option>
            <option value="merchandising">Merchandising</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            Estado del producto
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
            Imágenes del producto ({formData.imagenes.length}/{MAX_IMAGES})
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
                  {formData.imagenes.length < MAX_IMAGES && (
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
                Subir producto
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UploadProductForm; 