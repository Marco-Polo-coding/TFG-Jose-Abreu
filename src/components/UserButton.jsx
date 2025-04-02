import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import AuthModal from './AuthModal';

const UserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={popoverRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <FaUser className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
        </button>

        {isOpen && (
          <div className="absolute top-16 right-4 z-50 bg-white rounded-xl shadow-2xl p-4 w-56 transform transition-all duration-200 ease-in-out">
            <div className="space-y-3">
              <div className="px-2 py-1">
                <h3 className="text-sm font-semibold text-gray-700">Mi Cuenta</h3>
              </div>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => handleAuthClick('login')}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
              >
                <FaSignInAlt className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                onClick={() => handleAuthClick('register')}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
              >
                <FaUserPlus className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                <span>Registrarse</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};

export default UserButton; 