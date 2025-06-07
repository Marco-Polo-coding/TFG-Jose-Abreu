import React from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { authManager } from '../utils/authManager';

const handleLogout = () => {
  // Limpiar datos de autenticación usando Zustand
  authManager.clearAuthData();
  
  // Limpiar cookies
  document.cookie = 'userRole=; path=/; max-age=0';
  document.cookie = 'auth_token=; path=/; max-age=0';
  
  // Redirigir
  window.location.href = '/';
};

const Sidebar = () => (
  <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl min-h-screen flex flex-col border-r border-gray-200 dark:border-gray-700 transition-colors">
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Admin Sidebar</h1>
    </div>
    <nav className="flex-1 mt-4 flex flex-col gap-1 px-2">
      <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors font-medium">
        <FaChartBar className="w-5 h-5 text-purple-500" />
        Dashboard
      </a>
      <a href="/admin/users" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors font-medium">
        <FaUsers className="w-5 h-5 text-purple-500" />
        Usuarios
      </a>
      <a href="/admin/products" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors font-medium">
        <FaBox className="w-5 h-5 text-purple-500" />
        Productos
      </a>
      <a href="/admin/articles" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors font-medium">
        <FaNewspaper className="w-5 h-5 text-purple-500" />
        Artículos
      </a>
      <div className="flex-1" />
    </nav>
  </aside>
);

export default Sidebar; 