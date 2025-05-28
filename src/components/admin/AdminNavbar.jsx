import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaUserCircle, FaSearch, FaSignOutAlt } from 'react-icons/fa';

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
        <span className="bg-purple-500 text-white font-bold px-3 py-1 md:px-6 md:py-2 rounded-lg text-lg md:text-2xl shadow transition select-none">
          Panel de Administración
        </span>
        <button className="ml-3 flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 transition" aria-label="Abrir menú lateral">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
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
            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border-2 border-transparent hover:border-purple-300"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menú de usuario"
          >
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 border-4 border-white shadow">
              <FaUserCircle className="text-3xl text-white drop-shadow" />
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg border border-purple-100 rounded-2xl shadow-2xl z-50 animate-fade-in p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-600 hover:bg-red-100/60 rounded-lg transition-all duration-200 group font-semibold"
              >
                <FaSignOutAlt className="w-5 h-5 text-red-500 group-hover:text-red-700 transition-colors animate-pulse" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar; 