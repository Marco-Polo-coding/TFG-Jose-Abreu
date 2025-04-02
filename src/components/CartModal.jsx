import React from 'react';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';

const CartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <FaShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Tu carrito está vacío
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Añade algunos productos para verlos aquí
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal; 