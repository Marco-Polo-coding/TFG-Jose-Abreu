import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [resetForm, setResetForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [resetErrors, setResetErrors] = useState({});
  const [resetLoading, setResetLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword1, setShowResetPassword1] = useState(false);
  const [showResetPassword2, setShowResetPassword2] = useState(false);

  useEffect(() => {
    setIsLoginMode(mode === 'login');
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    // Solo autocompletar si es login y hay datos recordados
    if (mode === 'login') {
      const savedEmail = localStorage.getItem('rememberedEmail') || '';
      const savedPassword = localStorage.getItem('rememberedPassword') || '';
      if (savedEmail && savedPassword) {
        setFormData({ email: savedEmail, password: savedPassword, name: '' });
        setRememberMe(true);
      } else {
        setFormData({ email: '', password: '', name: '' });
        setRememberMe(false);
      }
    } else {
      setFormData({ email: '', password: '', name: '' });
      setRememberMe(false);
      // Limpiar datos recordados al cambiar a registro
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }
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

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('uid');
    localStorage.removeItem('userBio');
    // Eliminar datos recordados al cerrar sesión
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
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
          ...(isLoginMode ? {} : { nombre: formData.name })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la autenticación');
      }

      // Guardar email y contraseña si el usuario marcó 'Recordarme' SOLO en login
      if (isLoginMode && rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password);
      } else if (isLoginMode) {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      localStorage.setItem('token', data.idToken);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', data.nombre || formData.name || formData.email);
      if (data.uid) {
        localStorage.setItem('uid', data.uid);
      }
      if (data.foto) {
        localStorage.setItem('userPhoto', data.foto);
      } else {
        localStorage.removeItem('userPhoto');
      }
      // Biografía: si viene en la respuesta, guardar; si no, limpiar
      if (data.biografia !== undefined && data.biografia !== null) {
        localStorage.setItem('userBio', data.biografia);
      } else {
        localStorage.removeItem('userBio');
      }
      setIsAuthenticated(true);
      onLoginSuccess?.(formData.email, data.nombre || formData.name || formData.email, data.uid);
      
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
    setRememberMe(false);
    // Limpiar datos recordados al cambiar de modo
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  };

  const handleResetInput = (e) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDirectReset = async (e) => {
    e.preventDefault();
    const errors = validateResetForm(resetForm);
    setResetErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setResetLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/direct-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetForm.email,
          newPassword: resetForm.password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al actualizar la contraseña');
      // --- LOGIN AUTOMÁTICO ---
      const loginResponse = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetForm.email,
          password: resetForm.password
        })
      });
      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.detail || 'Contraseña cambiada, pero error al iniciar sesión');
      localStorage.setItem('token', loginData.idToken);
      localStorage.setItem('userEmail', resetForm.email);
      localStorage.setItem('userName', loginData.nombre || resetForm.email);
      if (loginData.uid) {
        localStorage.setItem('uid', loginData.uid);
      }
      if (loginData.foto) {
        localStorage.setItem('userPhoto', loginData.foto);
      } else {
        localStorage.removeItem('userPhoto');
      }
      // Biografía: si viene en la respuesta, guardar; si no, limpiar
      if (loginData.biografia !== undefined && loginData.biografia !== null) {
        localStorage.setItem('userBio', loginData.biografia);
      } else {
        localStorage.removeItem('userBio');
      }
      showNotification('Contraseña actualizada e inicio de sesión exitoso', 'success');
      setShowResetPassword(false);
      setResetForm({ email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const validateResetForm = (values) => {
    const errors = {};
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'El email no es válido';
    }
    // Validar contraseña
    if (!values.password) {
      errors.password = 'La contraseña es requerida';
    } else {
      if (values.password.length < 8) errors.password = 'Mínimo 8 caracteres';
      if (!/[A-Z]/.test(values.password)) errors.password = 'Debe tener una mayúscula';
      if (!/[a-z]/.test(values.password)) errors.password = 'Debe tener una minúscula';
      if (!/\d/.test(values.password)) errors.password = 'Debe tener un número';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) errors.password = 'Debe tener un carácter especial';
    }
    // Validar confirmación
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    return errors;
  };

  // Utilidad para saber si la foto es válida
  const userPhoto = (typeof window !== 'undefined') ? localStorage.getItem('userPhoto') : '';
  const isValidPhoto = userPhoto && !userPhoto.includes('googleusercontent.com') && userPhoto !== '';

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
                    ? 'Recuperar Contraseña'
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
                <form onSubmit={handleDirectReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={resetForm.email}
                        onChange={handleResetInput}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tu email"
                        required
                      />
                    </div>
                    {resetErrors.email && <p className="text-red-600 text-sm mt-1">{resetErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showResetPassword1 ? 'text' : 'password'}
                        name="password"
                        value={resetForm.password}
                        onChange={handleResetInput}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Nueva contraseña"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onMouseDown={() => setShowResetPassword1(true)}
                        onMouseUp={() => setShowResetPassword1(false)}
                        onMouseLeave={() => setShowResetPassword1(false)}
                        tabIndex={-1}
                      >
                        {showResetPassword1 ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {resetErrors.password && <p className="text-red-600 text-sm mt-1">{resetErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showResetPassword2 ? 'text' : 'password'}
                        name="confirmPassword"
                        value={resetForm.confirmPassword}
                        onChange={handleResetInput}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Repite la contraseña"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onMouseDown={() => setShowResetPassword2(true)}
                        onMouseUp={() => setShowResetPassword2(false)}
                        onMouseLeave={() => setShowResetPassword2(false)}
                        tabIndex={-1}
                      >
                        {showResetPassword2 ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {resetErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{resetErrors.confirmPassword}</p>}
                  </div>
                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Procesando...' : 'Actualizar Contraseña'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(false)}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              ) : (
                isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg animate-avatar-glow overflow-hidden`}>
                          {isValidPhoto ? (
                            <img src={userPhoto} alt={formData.name} className="w-full h-full object-cover" />
                          ) : (
                            (formData.name ? formData.name.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase())
                          )}
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
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isLoginMode && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              checked={rememberMe}
                              onChange={handleRememberMe}
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
                              if (data.foto) {
                                localStorage.setItem('userPhoto', data.foto);
                              } else {
                                localStorage.removeItem('userPhoto');
                              }
                              // Biografía: si viene en la respuesta, guardar; si no, limpiar
                              if (data.biografia !== undefined && data.biografia !== null) {
                                localStorage.setItem('userBio', data.biografia);
                              } else {
                                localStorage.removeItem('userBio');
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