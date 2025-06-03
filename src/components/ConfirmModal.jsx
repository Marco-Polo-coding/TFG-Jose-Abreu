import React from 'react';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro con gradiente */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-black/80 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:w-full sm:max-w-md sm:align-middle animate-fade-in">
          <div className="relative bg-white px-8 pt-8 pb-6 sm:p-10">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-purple-600 transition-colors text-xl"
              title="Cerrar"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Contenido */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg animate-pulse mb-4">
                <FaSignOutAlt className="h-8 w-8 text-white" />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-base text-gray-600">
                    {message}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="inline-flex justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-purple-200 rounded-full hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="inline-flex justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
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