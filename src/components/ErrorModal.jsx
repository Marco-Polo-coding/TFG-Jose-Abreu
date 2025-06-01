import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorModal = ({ isOpen, onClose, title, message, buttonText = 'Aceptar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo gris translúcido */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle animate-fade-in">
          <div className="relative bg-white px-8 pt-8 pb-6 sm:p-10">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-purple-600 transition-colors text-xl"
              title="Cerrar"
            >
              <FaExclamationTriangle className="w-6 h-6" />
            </button>
            {/* Contenido */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg animate-pulse mb-4">
                <FaExclamationTriangle className="h-8 w-8 text-white" />
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
                  className="inline-flex justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal; 