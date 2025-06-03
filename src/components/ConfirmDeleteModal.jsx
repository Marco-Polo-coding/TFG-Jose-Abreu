import React from 'react';

const ConfirmDeleteModal = ({ open, onClose, onConfirm, articleTitle, title, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in z-60">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title || '¿Eliminar artículo?'}</h2>
        <p className="text-gray-700 mb-6">
          {message || (<span>¿Estás seguro de que quieres eliminar <span className="font-semibold text-purple-700">{articleTitle}</span>? Esta acción no se puede deshacer.</span>)}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal; 