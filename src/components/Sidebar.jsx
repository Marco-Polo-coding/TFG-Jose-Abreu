import React from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  document.cookie = 'userRole=; path=/; max-age=0';
  window.location.href = '/';
};

const Sidebar = () => (
  <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
    </div>
    <nav className="mt-4">
      <a href="/admin/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
        <FaChartBar className="w-5 h-5 mr-2" />
        Dashboard
      </a>
      <a href="/admin/users" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
        <FaUsers className="w-5 h-5 mr-2" />
        Usuarios
      </a>
      <a href="/admin/products" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
        <FaBox className="w-5 h-5 mr-2" />
        Productos
      </a>
      <a href="/admin/articles" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
        <FaNewspaper className="w-5 h-5 mr-2" />
        Artículos
      </a>
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaSignOutAlt className="w-5 h-5 mr-2" />
        Cerrar Sesión
      </button>
    </nav>
  </aside>
);

export default Sidebar; 