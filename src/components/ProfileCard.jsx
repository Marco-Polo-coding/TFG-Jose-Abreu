import React, { useEffect } from 'react';
import { FaBook, FaShoppingBag, FaChartLine, FaPlus, FaArrowRight } from 'react-icons/fa';

function getInitials(email) {
  if (!email) return '';
  return email.charAt(0).toUpperCase();
}

function getRandomColor(email) {
  const colors = [
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-purple-500',
    'from-blue-500 to-teal-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
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
      {/* Tarjeta principal con efecto glassmorphism */}
      <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-8 mb-16 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 ring-2 ring-purple-100">
        {/* Avatar con borde animado y gradiente */}
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center text-white text-6xl font-extrabold shadow-xl border-4 border-white bg-gradient-to-br ${getRandomColor(userEmail)} animate-avatar-glow relative`}>
            {getInitials(userEmail)}
            <span className="absolute -bottom-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg animate-bounce">Tú</span>
          </div>
        </div>
        {/* Info usuario */}
        <div className="text-center md:text-left w-full">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-lg">{userName || userEmail}</h2>
          <p className="text-lg text-gray-500 mb-2">{userEmail}</p>
          <button className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            <FaPlus className="w-4 h-4" /> Editar perfil
          </button>
        </div>
      </div>

      {/* Secciones de Artículos y Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Artículos publicados */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border border-white/40 shadow-lg flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaBook />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Artículos publicados</h3>
          </div>
          <p className="text-gray-500 text-base mb-4">No has publicado ningún artículo todavía</p>
          <a href="/post_article" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            <FaPlus className="w-4 h-4" /> Publicar artículo
          </a>
        </div>
        {/* Ventas en curso */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border border-white/40 shadow-lg flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaShoppingBag />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Ventas en curso</h3>
          </div>
          <p className="text-gray-500 text-base mb-4">No tienes ventas en curso todavía</p>
          <a href="/upload_product" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            <FaPlus className="w-4 h-4" /> Subir producto
          </a>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-10 border border-white/30 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
            <FaChartLine />
          </span>
          <h3 className="text-2xl font-bold text-gray-900">Estadísticas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">0</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaBook className="w-5 h-5" /> Artículos</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">0</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaShoppingBag className="w-5 h-5" /> Ventas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">0</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaArrowRight className="w-5 h-5" /> Likes</p>
          </div>
        </div>
      </div>
      {/* Animación avatar (tailwind custom):
      .animate-avatar-glow {
        box-shadow: 0 0 0 0 rgba(139,92,246,0.7);
        animation: avatar-glow 2s infinite alternate;
      }
      @keyframes avatar-glow {
        0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.7); }
        100% { box-shadow: 0 0 40px 10px rgba(139,92,246,0.3); }
      }
      */}
    </div>
  );
};

export default ProfileCard; 