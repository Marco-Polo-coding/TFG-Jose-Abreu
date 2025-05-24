// src/components/CartModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import Toast from './Toast';

const CartModal = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id) => {
    removeItem(id);
    showNotification('Producto eliminado del carrito');
  };

  const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
          <div className="relative bg-white px-6 pt-5 pb-4 sm:p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <FaShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                Tu Carrito
              </h3>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Tu carrito está vacío
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.nombre}</h4>
                        <p className="text-gray-500">${item.precio}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FaMinus />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Seguir comprando
              </button>
              {items.length > 0 && (
                <button
                  onClick={() => {/* Implementar checkout */}}
                  className="inline-flex justify-center rounded-lg border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Proceder al pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default CartModal;