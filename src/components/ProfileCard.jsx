import React, { useEffect } from 'react';
import { FaBook, FaShoppingBag, FaChartLine } from 'react-icons/fa';

function getInitials(email) {
  if (!email) return '';
  return email.charAt(0).toUpperCase();
}

function getRandomColor(email) {
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
}

const ProfileCard = () => {
  const [userEmail, setUserEmail] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [token, setToken] = React.useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      setToken(t);
      setUserEmail(email);
      setUserName(name);
      if (!t) {
        window.location.href = '/';
      }
    }
  }, []);

  if (!token) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Información del usuario */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 mb-16 bg-white rounded-2xl shadow p-8 border border-gray-100">
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white -mt-20 md:mt-0 ${getRandomColor(userEmail)}`}>
            {getInitials(userEmail)}
          </div>
        </div>
        <div className="text-center md:text-left w-full">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{userName || userEmail}</h2>
          <p className="text-lg text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Artículos publicados */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FaBook className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Artículos publicados</h3>
          </div>
          <p className="text-gray-500 text-sm">
            No has publicado ningún artículo todavía
          </p>
        </div>

        {/* Ventas en curso */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FaShoppingBag className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ventas en curso</h3>
          </div>
          <p className="text-gray-500 text-sm">
            No tienes ventas en curso todavía
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow border border-gray-100">
            <p className="text-3xl font-extrabold text-purple-600">0</p>
            <p className="text-base text-gray-500">Artículos</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow border border-gray-100">
            <p className="text-3xl font-extrabold text-purple-600">0</p>
            <p className="text-base text-gray-500">Ventas</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow border border-gray-100">
            <p className="text-3xl font-extrabold text-purple-600">0</p>
            <p className="text-base text-gray-500">Likes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 