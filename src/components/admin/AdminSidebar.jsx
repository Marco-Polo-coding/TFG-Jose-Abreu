import React from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartBar, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const navItems = [
  { href: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
  { href: '/admin/users', icon: <FaUsers />, label: 'Usuarios' },
  { href: '/admin/products', icon: <FaBox />, label: 'Productos' },
  { href: '/admin/compras', icon: <FaShoppingCart />, label: 'Compras' },
  { href: '/admin/articles', icon: <FaNewspaper />, label: 'Artículos' },
];

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  document.cookie = 'userRole=; path=/; max-age=0';
  window.location.href = '/';
};

const AdminSidebar = () => {
  // Si no usas react-router-dom, puedes obtener la ruta actual de otra forma
  let current = window.location.pathname;

  return (
    <aside className="h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="bg-indigo-600 text-white rounded-xl px-3 py-1 font-bold text-lg tracking-wide">Admin</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white">Panel</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg text-base font-medium transition-colors
                ${current === item.href ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <span className={`text-xl ${current === item.href ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mb-6 px-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 transition shadow"
        >
          <FaSignOutAlt className="text-lg" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 