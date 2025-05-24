import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import CartModal from './CartModal';
import useCartStore from '../store/cartStore';

const CartButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-full shadow-lg hover:shadow-2xl border-2 border-white hover:border-purple-300 transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <FaShoppingCart className="w-7 h-7 text-white transition-colors drop-shadow" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <CartModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default CartButton;