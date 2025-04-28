import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBookmark, FaHeart, FaUserCircle } from 'react-icons/fa';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import ConfirmModal from './ConfirmModal';

const UserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
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

  useEffect(() => {
    // Verificar el estado de autenticación al cargar y cuando cambie el token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      setUserEmail(localStorage.getItem('userEmail') || '');
      setUserName(localStorage.getItem('userName') || '');
    }
  }, []);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setShowConfirmModal(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setShowConfirmModal(false);
    // Recargar la página después de cerrar sesión
    window.location.reload();
  };

  const getInitials = (email) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  const getRandomColor = (email) => {
    const colors = [
      'bg-purple-500',
      'bg-indigo-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-gray-500'
    ];
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <div className="relative" ref={popoverRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          {isAuthenticated ? (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getRandomColor(userEmail)}`}>
              {getInitials(userEmail)}
            </div>
          ) : (
            <FaUser className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-16 right-4 z-50 bg-white rounded-xl shadow-2xl p-4 w-64 transform transition-all duration-200 ease-in-out">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${getRandomColor(userEmail)}`}>
                    {getInitials(userEmail)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {userName || userEmail}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100"></div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                  >
                    <FaUserCircle className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    <span>Ver mi Perfil</span>
                  </button>
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                  >
                    <FaBookmark className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    <span>Artículos guardados</span>
                  </button>
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                  >
                    <FaHeart className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    <span>Productos favoritos</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <FaSignOutAlt className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onLoginSuccess={(email, name) => {
          setUserEmail(email);
          setUserName(name);
          setIsAuthenticated(true);
          // Recargar la página después de iniciar sesión
          window.location.reload();
        }}
      />

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={{
          email: userEmail,
          name: userName || userEmail
        }}
      />

      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta."
      />
    </>
  );
};

export default UserButton; 