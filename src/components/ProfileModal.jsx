import React from 'react';
import { FaTimes, FaBook, FaShoppingBag, FaChartLine } from 'react-icons/fa';

const ProfileModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;

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
  const userPhoto = localStorage.getItem('userPhoto');
  const isValidPhoto = userPhoto && !userPhoto.includes('googleusercontent.com') && userPhoto !== '';

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="relative bg-white px-6 pt-5 pb-4 sm:p-6">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Contenido del perfil */}
            <div className="space-y-6">
              {/* Información del usuario */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl ${getRandomColor(userData.email)} overflow-hidden`}>
                    {isValidPhoto ? (
                      <img src={userPhoto} alt={userData.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(userData.name || userData.email)
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userData.name || userData.email}
                </h2>
                <p className="text-gray-500">
                  {userData.email}
                </p>
              </div>

              {/* Secciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Artículos publicados */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaBook className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Artículos publicados</h3>
                  </div>
                  <p className="text-gray-500 text-sm">
                    No has publicado ningún artículo todavía
                  </p>
                </div>

                {/* Ventas en curso */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaShoppingBag className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Ventas en curso</h3>
                  </div>
                  <p className="text-gray-500 text-sm">
                    No tienes ventas en curso todavía
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <FaChartLine className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-sm text-gray-500">Artículos</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-sm text-gray-500">Ventas</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-sm text-gray-500">Likes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 