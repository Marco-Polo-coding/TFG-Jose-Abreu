import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import CartModal from './CartModal';

const CartButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        <FaShoppingCart className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
      </button>

      <CartModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default CartButton; 