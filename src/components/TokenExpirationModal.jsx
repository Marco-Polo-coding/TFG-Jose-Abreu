import React, { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const TokenExpirationModal = ({ isOpen, onClose, onExtendSession, timeUntilExpiration }) => {
  const [currentTime, setCurrentTime] = useState(timeUntilExpiration);
  
  useEffect(() => {
    setCurrentTime(timeUntilExpiration);
  }, [timeUntilExpiration]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = Math.max(0, prev - 1);
        // Si el tiempo llega a 0, cerrar el modal automáticamente
        if (newTime === 0) {
          onClose();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const minutes = Math.ceil(currentTime / 60);
  const seconds = currentTime % 60;
  const isUrgent = minutes <= 1;

  const handleExtendSession = () => {
    onExtendSession();
    onClose();
  };

  const handleLogout = () => {
    onClose();
    // El authManager manejará el logout automáticamente si no se extiende la sesión
  };

  return (
    <div className="fixed inset-0 z-[400] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 text-center sm:block sm:p-0">
        {/* Fondo oscuro con gradiente */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-orange-900/80 via-red-900/70 to-black/80 transition-opacity backdrop-blur-sm"
          onClick={handleLogout}
        />        {/* Modal */}
        <div className={`inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:w-full sm:max-w-lg sm:align-middle animate-fade-in ${
          currentTime <= 10 ? 'animate-shake' : ''
        }`}>
          <div className="relative bg-white px-8 pt-8 pb-6 sm:p-10">
            {/* Botón de cerrar */}
            <button
              onClick={handleLogout}
              className="absolute right-6 top-6 text-gray-400 hover:text-red-600 transition-colors text-xl"
              title="Cerrar y cerrar sesión"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Contenido */}
            <div className="text-center">
              {/* Icono animado */}
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                isUrgent 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500'
              } shadow-lg mb-6 relative`}>
                <FaClock className="h-10 w-10 text-white" />
                {isUrgent && (
                  <div className="absolute -top-1 -right-1">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Título */}
              <h3 className={`text-2xl font-extrabold mb-3 ${
                isUrgent ? 'text-red-600' : 'text-orange-600'
              }`}>
                ⚠️ Tu sesión está por expirar
              </h3>              {/* Mensaje principal */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  Tu sesión expirará en{' '}
                  <span className={`font-bold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                    {minutes > 0 ? `${minutes} minuto${minutes !== 1 ? 's' : ''}` : `${seconds} segundo${seconds !== 1 ? 's' : ''}`}
                  </span>
                </p>
                <p className="text-base text-gray-600">
                  {isUrgent 
                    ? '¡Actúa rápidamente para no perder tu progreso!' 
                    : '¿Deseas continuar con tu sesión actual?'
                  }
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <FaExclamationTriangle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-800">
                    Información importante
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Si no alargas tu sesión, serás desconectado automáticamente y 
                  redirigido a la página principal por seguridad.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogout}
                  className="order-2 sm:order-1 inline-flex justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={handleExtendSession}
                  className={`order-1 sm:order-2 inline-flex justify-center px-8 py-3 text-base font-semibold text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                    isUrgent
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500 animate-pulse'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'
                  }`}
                >
                  {isUrgent ? '¡Extender ahora!' : 'Continuar sesión'}
                </button>
              </div>              {/* Contador visual */}
              <div className="mt-6">
                <div className={`bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner ${
                  currentTime <= 10 ? 'animate-pulse' : ''
                }`}>
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear relative ${
                      isUrgent 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, (currentTime / timeUntilExpiration) * 100)}%` 
                    }}
                  >
                    {/* Efecto de brillo cuando está crítico */}
                    {currentTime <= 30 && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className={`text-xs ${
                    currentTime <= 10 
                      ? 'text-red-600 font-bold animate-pulse' 
                      : isUrgent 
                        ? 'text-red-500 font-semibold' 
                        : 'text-gray-500'
                  }`}>
                    Tiempo restante: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                  </p>
                  <p className={`text-xs ${
                    currentTime <= 10 ? 'text-red-500 font-bold' : 'text-gray-400'
                  }`}>
                    {currentTime}s
                  </p>
                </div>
                
                {/* Mensaje de alerta crítica */}
                {currentTime <= 10 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                    <p className="text-xs text-red-700 font-semibold text-center">
                      ⚠️ ¡Tiempo crítico! La sesión expirará muy pronto
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationModal;
