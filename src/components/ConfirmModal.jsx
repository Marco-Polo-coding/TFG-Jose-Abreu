import React from 'react';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
          <div className="relative bg-white px-6 pt-5 pb-4 sm:p-6">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Contenido */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FaSignOutAlt className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 