import React from 'react';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

const AdminNavbar = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Panel de Administración</span>
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1 ml-6">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm w-32 md:w-48"
            disabled
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative">
          <FaBell className="text-xl text-gray-500 dark:text-gray-300" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span>
        </button>
        <button>
          <FaUserCircle className="text-3xl text-gray-400 dark:text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar; 