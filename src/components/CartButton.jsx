import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import CartModal from './CartModal';

const CartButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-full shadow-lg hover:shadow-2xl border-2 border-white hover:border-purple-300 transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <FaShoppingCart className="w-7 h-7 text-white transition-colors drop-shadow" />
      </button>

      <CartModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default CartButton; 