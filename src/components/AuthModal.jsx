import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import Toast from './Toast';
import { GoogleLogin } from '@react-oauth/google';

const AuthModal = ({ isOpen, onClose, mode, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    setIsLoginMode(mode === 'login');
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [mode]);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    showNotification('Has cerrado sesión correctamente', 'info');
    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isLoginMode 
        ? 'http://127.0.0.1:8000/auth/login'
        : 'http://127.0.0.1:8000/auth/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la autenticación');
      }

      localStorage.setItem('token', data.idToken);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', data.name || formData.name || formData.email);
      if (data.uid) {
        localStorage.setItem('uid', data.uid);
      }
      setIsAuthenticated(true);
      onLoginSuccess?.(formData.email, data.name || formData.name || formData.email, data.uid);
      
      showNotification(
        isLoginMode ? '¡Inicio de sesión exitoso!' : '¡Cuenta creada exitosamente!',
        'success'
      );
      
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = () => {
    setFormData({
      email: '',
      password: '',
      name: ''
    });
    setIsLoginMode(!isLoginMode);
  };

  if (!isOpen) return null;

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <div className="inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle animate-fade-in">
            <div className="relative bg-white px-8 pt-8 pb-6 sm:p-10">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 text-gray-400 hover:text-purple-600 transition-colors text-xl"
                title="Cerrar"
              >
                <FaTimes className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  {showResetPassword
                    ? 'Restablecer Contraseña'
                    : isAuthenticated 
                      ? 'Tu Cuenta' 
                      : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </h2>
                <p className="text-gray-600 text-base">
                  {showResetPassword
                    ? 'Introduce tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.'
                    : isAuthenticated 
                      ? 'Has iniciado sesión correctamente' 
                      : (isLoginMode 
                        ? 'Bienvenido de nuevo' 
                        : 'Únete a nuestra comunidad')
                  }
                </p>
              </div>

              {showResetPassword ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="resetEmail"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
                  >
                    Enviar instrucciones
                  </button>
                  <button
                    type="button"
                    className="w-full mt-2 bg-gray-200 text-gray-700 py-3 px-4 rounded-full font-semibold hover:bg-gray-300 transition-all duration-200"
                    onClick={() => setShowResetPassword(false)}
                  >
                    Volver
                  </button>
                </form>
              ) : (
                isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg animate-avatar-glow">
                          {formData.email.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2 text-lg">
                        <span className="font-semibold">{formData.name || formData.email}</span>
                      </p>
                      <p className="text-base text-gray-500 mb-4">
                        {formData.email}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-full font-semibold shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                      >
                        <FaSignOutAlt />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {!isLoginMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUser className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                              placeholder="Tu nombre"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {isLoginMode && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              Recordarme
                            </label>
                          </div>
                          <button
                            type="button"
                            className="text-sm text-purple-600 hover:text-purple-500"
                            onClick={() => setShowResetPassword(true)}
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 text-lg ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading 
                          ? 'Procesando...' 
                          : isLoginMode 
                            ? 'Iniciar Sesión' 
                            : 'Crear Cuenta'
                        }
                      </button>
                    </form>

                    <div className="flex items-center my-8">
                      <div className="flex-grow h-px bg-gray-300" />
                      <span className="mx-3 text-gray-500 text-base">O continúa con</span>
                      <div className="flex-grow h-px bg-gray-300" />
                    </div>

                    <div className="mb-4 flex justify-center">
                      <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                          const id_token = credentialResponse.credential;
                          if (!id_token) {
                            showNotification('No se pudo obtener el id_token de Google', 'error');
                            return;
                          }
                          try {
                            const response = await fetch('http://127.0.0.1:8000/auth/google', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id_token }),
                            });
                            const data = await response.json();
                            if (response.ok) {
                              localStorage.setItem('token', data.idToken);
                              localStorage.setItem('userEmail', data.email);
                              localStorage.setItem('userName', data.nombre || data.email);
                              if (data.uid) {
                                localStorage.setItem('uid', data.uid);
                              }
                              setIsAuthenticated(true);
                              onLoginSuccess?.(data.email, data.nombre || data.email, data.uid);
                              showNotification('¡Inicio de sesión con Google exitoso!', 'success');
                              onClose();
                              setTimeout(() => {
                                window.location.reload();
                              }, 1500);
                            } else {
                              showNotification(data.detail || 'Error al iniciar sesión con Google', 'error');
                            }
                          } catch (err) {
                            showNotification('Error al conectar con el servidor', 'error');
                          }
                        }}
                        onError={() => {
                          showNotification('Error al iniciar sesión con Google', 'error');
                        }}
                      />
                    </div>
                  </>
                )
              )}

              {!isAuthenticated && (
                <div className="mt-4 text-center">
                  <p className="text-base text-gray-600">
                    {isLoginMode ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    <button
                      onClick={handleModeChange}
                      className="ml-1 text-purple-600 hover:text-purple-500 font-semibold"
                    >
                      {isLoginMode ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal; 