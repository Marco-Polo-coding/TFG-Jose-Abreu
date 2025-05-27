import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    document.cookie = 'userRole=; path=/; max-age=0';
    window.location.href = '/';
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 dark:border-gray-800 z-10 relative">
      {/* Título centrado */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
        <span className="bg-purple-500 text-white font-bold px-6 py-2 rounded-lg text-2xl shadow transition select-none">
          Panel de Administración
        </span>
      </div>
      {/* Buscador a la derecha */}
      <div className="flex-1 flex justify-end items-center gap-6">
        {/* <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm w-32 md:w-48"
            disabled
          />
        </div> */}
        {/* <button className="relative group">
          <FaBell className="text-xl text-gray-500 dark:text-gray-300 group-hover:text-purple-500 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 border-2 border-white dark:border-gray-900 animate-pulse-slow">3</span>
        </button> */}
        {/* Menú de usuario */}
        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-purple-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menú de usuario"
          >
            <FaUserCircle className="text-3xl text-purple-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-slide-up">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar; 