import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const CartButton = () => {
  return (
    <button 
      onClick={() => {
        // Lógica para el carrito
      }}
      className="absolute top-4 right-20 z-50 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
    >
      <div className="relative">
        <FaShoppingCart className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
        <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          0
        </span>
      </div>
    </button>
  );
};

export default CartButton; 