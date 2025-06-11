// src/components/CartModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaShoppingCart, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import Toast from './Toast';
import LoadingSpinner from './LoadingSpinner';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';

const CartModal = ({ isOpen, onClose, onOpenLoginModal }) => {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [productStocks, setProductStocks] = useState({});
  useEffect(() => {
    if (isOpen) {
      setShowToast(false);
      setToastMessage('');
      setToastType('success');
        // Verificar stock de productos en el carrito
      const checkStocks = async () => {
        const stocks = {};
        for (const item of items) {
          try {
            const response = await apiManager.get(`/productos/${item.id}`);
            stocks[item.id] = response.stock;
          } catch (error) {
            console.error(`Error obteniendo stock para producto ${item.id}:`, error);
            stocks[item.id] = 0;
          }
        }
        setProductStocks(stocks);
      };
      
      if (items.length > 0) {
        checkStocks();
      }
    }
  }, [isOpen, items]);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Usar el stock ya obtenido si está disponible
    const availableStock = productStocks[id];
    if (availableStock !== undefined && newQuantity > availableStock) {
      showNotification(`Solo hay ${availableStock} unidades disponibles`, 'error');
      return;
    }
      // Si no tenemos el stock en cache, verificarlo
    if (availableStock === undefined) {
      try {
        const response = await apiManager.get(`/productos/${id}`);
        const product = response;
        
        if (newQuantity > product.stock) {
          showNotification(`Solo hay ${product.stock} unidades disponibles`, 'error');
          return;
        }
        
        // Actualizar cache
        setProductStocks(prev => ({ ...prev, [id]: product.stock }));
      } catch (error) {
        console.error('Error verificando stock:', error);
        showNotification('Error al verificar el stock disponible', 'error');
        return;
      }
    }
    
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
              <div className="space-y-4">                {items.map((item) => {
                  const availableStock = productStocks[item.id];
                  const isStockLimited = availableStock !== undefined && item.quantity >= availableStock;
                  
                  return (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={Array.isArray(item.imagenes) && item.imagenes.length > 0 ? item.imagenes[0] : (item.imagen || 'https://cataas.com/cat')}
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.nombre.length > 18 ? item.nombre.slice(0, 18) + '...' : item.nombre}</h4>
                        <p className="text-gray-500">${item.precio}</p>
                        {availableStock !== undefined && (
                          <p className="text-xs text-gray-400">Stock: {availableStock}</p>
                        )}
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
                        disabled={isStockLimited}
                        className={`p-1 ${isStockLimited ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                        title={isStockLimited ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
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
                  );
                })}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center space-x-3">
              {items.length > 0 ? (
                <button
                  onClick={() => {
                    clearCart();
                    showNotification('Carrito vaciado', 'success');
                  }}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  Vaciar el carrito
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-white border-2 border-purple-400 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-purple-50 transition-all duration-300"
                >
                  Seguir comprando
                </button>
              )}
              {items.length > 0 && (                <button
                  onClick={() => {
                    const user = authManager.getUser();
                    const uid = user?.uid;
                    const userEmail = user?.email;
                    if (!uid && !userEmail) {
                      showNotification('Debes registrarte o iniciar sesión antes de poder comprar un producto', 'error');
                      return;
                    }
                    setLoadingCheckout(true);
                    setTimeout(() => {
                      window.location.href = '/checkout';
                    }, 1500);
                  }}
                  disabled={loadingCheckout}
                  className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 ${loadingCheckout ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {loadingCheckout && <LoadingSpinner />}
                  {loadingCheckout ? 'Redirigiendo...' : 'Proceder al pago'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showToast && toastMessage && (
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => {
            setShowToast(false);
            setToastMessage('');
          }}
        />
      )}
    </div>
  );
};

export default CartModal;