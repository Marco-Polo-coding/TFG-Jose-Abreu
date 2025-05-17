import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBookmark, FaHeart, FaUserCircle, FaNewspaper, FaBox } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import ConfirmModal from './ConfirmModal';
import AuthModal from './AuthModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
const clientId = "1040096324756-vf83konj4f2794dpau2119934d5jbu0p.apps.googleusercontent.com";

const UserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
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
      setUserPhoto(localStorage.getItem('userPhoto') || '');
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
    localStorage.removeItem('userPhoto');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserPhoto('');
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
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border-2 border-transparent hover:border-purple-300"
        >
          {isAuthenticated ? (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 border-0 border-white shadow ${getRandomColor(userEmail)}`}>
              {userPhoto ? (
                <img src={userPhoto} alt={userName || userEmail} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(userEmail)
              )}
            </div>
          ) : (
            <FaUser className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-16 right-4 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-80 border border-purple-100 ring-1 ring-purple-100 animate-fade-in">
            {isAuthenticated ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-4 pb-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 border-4 border-white shadow ${getRandomColor(userEmail)}`}>
                    {userPhoto ? (
                      <img src={userPhoto} alt={userName || userEmail} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(userEmail)
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 leading-tight">{userName || userEmail}</h3>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
                <div className="border-t border-purple-100"></div>
                <div className="space-y-2">
                  <a
                    href="/profile"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium"
                  >
                    <FaUserCircle className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Ver mi Perfil</span>
                  </a>
                  <a
                    href="/saved_articles"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium"
                  >
                    <FaBookmark className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Artículos guardados</span>
                  </a>
                  <a
                    href="/favorite_products"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium"
                  >
                    <FaHeart className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Productos favoritos</span>
                  </a>
                  <a
                    href="/my_articles"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium"
                  >
                    <FaNewspaper className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Mis Artículos</span>
                  </a>
                  <a
                    href="/my_products"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium"
                  >
                    <FaBox className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Mis Productos</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-red-600 hover:bg-red-100/60 rounded-lg transition-all duration-200 group font-semibold mt-2"
                  >
                    <FaSignOutAlt className="w-5 h-5 text-red-500 group-hover:text-red-700 transition-colors animate-pulse" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="px-2 py-1">
                  <h3 className="text-lg font-extrabold text-gray-800 mb-1">Mi Cuenta</h3>
                  <div className="border-t border-gray-200 mb-2" />
                </div>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-purple-50 rounded-xl transition-all duration-200 group font-medium"
                >
                  <FaSignInAlt className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base text-purple-700 bg-gradient-to-r from-purple-100 via-purple-50 to-white hover:from-purple-200 hover:to-purple-100 rounded-xl transition-all duration-200 group font-semibold shadow hover:shadow-lg hover:scale-105 border border-purple-100"
                  style={{ boxShadow: '0 2px 12px 0 rgba(168, 85, 247, 0.10)' }}
                >
                  <FaUserPlus className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                  <span>Registrarse</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <GoogleOAuthProvider clientId={clientId}>
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
      </GoogleOAuthProvider>
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