import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBookmark, FaHeart, FaUserCircle, FaNewspaper, FaBox, FaSun, FaMoon, FaComments } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import ConfirmModal from './ConfirmModal';
import AuthModal from './AuthModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { wsChatManager } from '../utils/wsChatManager';
const clientId = "1040096324756-vf83konj4f2794dpau2119934d5jbu0p.apps.googleusercontent.com";

const UserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(authManager.getUser() || {});
  const userEmail = user?.email || '';
  const userName = user?.name || '';
  const userPhoto = user?.photo || '';
  const popoverRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [unreadChats, setUnreadChats] = useState(0);
  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const handleAuthChange = (event) => {
      const userData = event.detail;
      setUser(userData || {});
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

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
    // Suscribirse a cambios en el store global de autenticación
    const unsub = authManager.store.subscribe((state) => {
      setUser(state.user || {});
    });
    // Inicializar valores
    setUser(authManager.getUser() || {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchUnreadChats = async () => {
      if (!authManager.isAuthenticated()) return;
      try {        const userChats = await directChatManager.getChats();
        const currentUser = authManager.getUser();
        const currentUid = currentUser?.uid;
        
        if (!currentUid) return;
        
        let count = 0;
        userChats.forEach(chat => {
          const lastMsg = chat.last_message;
          if (lastMsg && lastMsg.sender !== currentUid && (!lastMsg.read_by || !lastMsg.read_by.includes(currentUid))) {
            count++;
          }
        });
        setUnreadChats(count);
      } catch (e) {
        setUnreadChats(0);
      }
    };
    fetchUnreadChats();
    // Exponer la función global para refrescar desde otros componentes
    window.refreshUnreadChats = fetchUnreadChats;
    // Polling cada 15 segundos
    const interval = setInterval(fetchUnreadChats, 15000);
    // Suscribirse a eventos de WebSocket para refrescar en tiempo real
    const handleWSMessage = () => fetchUnreadChats();
    const handleWSRead = () => fetchUnreadChats();
    wsChatManager.on('message', handleWSMessage);
    wsChatManager.on('read', handleWSRead);
    return () => {
      clearInterval(interval);
      window.refreshUnreadChats = undefined;
      wsChatManager.off('message', handleWSMessage);
      wsChatManager.off('read', handleWSRead);
    };
  }, [authManager.isAuthenticated()]);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };  const handleLogout = () => {
    setShowConfirmModal(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    authManager.clearAuthData();
    setShowConfirmModal(false);
    window.location.href = '/';
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

  // Utilidad para saber si la foto es válida
  const isValidPhoto = userPhoto && !userPhoto.includes('googleusercontent.com') && userPhoto !== '';

  const toggleDarkMode = () => setDarkMode(dm => !dm);

  return (
    <>
      <div className="relative" ref={popoverRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white ${authManager.isAuthenticated() ? 'p-0' : 'p-3'} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border-2 border-transparent hover:border-purple-300`}
        >
          {authManager.isAuthenticated() ? (
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 border-0 border-white shadow ${getRandomColor(userEmail)}`}>
              {isValidPhoto ? (
                <img src={userPhoto} alt={userName || userEmail} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(userName || userEmail)
              )}
            </div>
          ) : (
            <FaUser className="w-10 h-10 text-purple-600 group-hover:text-purple-700 transition-colors" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-16 right-4 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-80 border border-purple-100 ring-1 ring-purple-100 animate-fade-in">
            {authManager.isAuthenticated() ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-4 pb-0.5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-white shadow ${getRandomColor(userEmail)}`}>
                    {isValidPhoto ? (
                      <img src={userPhoto} alt={userName || userEmail} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(userName || userEmail)
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 leading-tight">{userName || userEmail}</h3>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
                <div className="border-t border-purple-100 mt-1"></div>
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
                    href="/chat"
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 hover:bg-purple-100/60 rounded-lg transition-all duration-200 group font-medium relative"
                  >
                    <FaComments className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors" />
                    <span>Mis mensajes</span>
                    {unreadChats > 0 && (
                      <span className="absolute -top-2 left-7 bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow animate-bounce">
                        {unreadChats}
                      </span>
                    )}
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
                  {/* <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-base text-gray-700 dark:text-gray-200 hover:bg-purple-100/60 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group font-semibold"
                    aria-label="Cambiar modo oscuro/claro"
                  >
                    {darkMode ? <FaSun className="w-5 h-5 text-yellow-400" /> : <FaMoon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
                    <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
                  </button> */}
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
            // Eliminar la recarga de página y usar solo el store global
            setShowAuthModal(false);
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