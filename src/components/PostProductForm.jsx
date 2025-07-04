import React, { useState } from 'react';
import { FaImage, FaSpinner, FaPlus } from 'react-icons/fa';

const PostProductForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'juego',
    estado: 'nuevo',
    imagen: null
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const NAME_LIMIT = 100;
  const DESC_LIMIT = 300;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? Math.max(1, Number(value)) : value
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
        let value = formData[key];
        if (key === 'precio' && typeof value === 'string') {
          value = value.replace(',', '.');
          value = parseFloat(value);
        }
        if (key === 'imagen') {
          if (value) formDataToSend.append('imagen', value);
        } else if (key !== 'stock') {
          formDataToSend.append(key, value);
        }
      });
      formDataToSend.append('stock', 1);

      const response = await fetch('http://localhost:8000/productos', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        window.location.href = '/tienda';
      } else {
        throw new Error('Error al crear el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el producto. Por favor, intenta de nuevo.');
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
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock
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
              placeholder="1"
            />
          </div>
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
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="juego">Juego</option>
            <option value="accesorios">Accesorios</option>
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
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="nuevo">Nuevo</option>
            <option value="como_nuevo">Como nuevo</option>
            <option value="bueno">Bueno</option>
            <option value="aceptable">Aceptable</option>
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del producto
          </label>
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
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </>
            )}
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
                Creando producto...
              </>
            ) : (
              <>
                <FaPlus className="mr-2 h-5 w-5" />
                Crear producto
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostProductForm; 