import React, { useState, useEffect } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';

const ImageUpload = ({ value, onImageSelect, onImageRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) setPreview(null);
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar el tipo de archivo
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        alert('Por favor, selecciona una imagen válida (JPEG, PNG o GIF)');
        return;
      }

      // Verificar el tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede ser mayor a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors">
          <FaImage className="w-5 h-5" />
          <span>Añadir imagen/GIF</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload; 