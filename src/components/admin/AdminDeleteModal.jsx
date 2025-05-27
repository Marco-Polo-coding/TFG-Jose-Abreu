import React from 'react';
import { FaTrash } from 'react-icons/fa';

const AdminDeleteModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg animate-pulse">
            <FaTrash className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title || '¿Eliminar elemento?'}</h2>
        <p className="text-gray-700 mb-6 break-words max-w-xs mx-auto">
          {message || '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.'}
          {itemName && (
            <span
              className="block mt-2 font-semibold text-purple-700 truncate max-w-xs mx-auto cursor-help"
              title={itemName}
              style={{ wordBreak: 'break-word' }}
            >
              {itemName}
            </span>
          )}
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

export default AdminDeleteModal; 