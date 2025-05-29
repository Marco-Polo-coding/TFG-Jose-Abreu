import React, { useEffect, useState } from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartBar, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';

const navItems = [
  { href: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
  { href: '/admin/users', icon: <FaUsers />, label: 'Usuarios' },
  { href: '/admin/products', icon: <FaBox />, label: 'Productos' },
  { href: '/admin/compras', icon: <FaShoppingCart />, label: 'Compras' },
  { href: '/admin/articles', icon: <FaNewspaper />, label: 'Artículos' },
];

const handleLogout = () => {
  const clearCartOnLogout = useCartStore.getState().clearCartOnLogout;
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhoto');
  localStorage.removeItem('uid');
  document.cookie = 'userRole=; path=/; max-age=0';
  clearCartOnLogout();
  window.location.href = '/';
};

const AdminSidebar = () => {
  const [current, setCurrent] = useState('');

  useEffect(() => {
    setCurrent(window.location.pathname);
  }, []);

  return (
    <aside className="hidden md:flex h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="bg-purple-500 text-white rounded-xl px-3 py-1 font-bold text-lg tracking-wide">Admin Sidebar</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg text-base font-medium transition-colors
                ${current === item.href ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <span className={`text-xl ${current === item.href ? 'text-purple-500 dark:text-purple-300' : 'text-gray-400 dark:text-gray-500'}`}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      {/* Logout oculto temporalmente */}
    </aside>
  );
};

export default AdminSidebar;