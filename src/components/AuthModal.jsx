import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaSignOutAlt, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import Toast from './Toast';
import { GoogleLogin } from '@react-oauth/google';
import useCartStore from '../store/cartStore';
import PasswordRequirements from './PasswordRequirements';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';

const AuthModal = ({ isOpen, onClose, mode, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);
  const clearCartOnLogout = useCartStore(state => state.clearCartOnLogout);

  useEffect(() => {
    setIsLoginMode(mode === 'login');
    // Solo autocompletar si es login y hay email recordado
    if (mode === 'login') {
      const savedEmail = localStorage.getItem('rememberedEmail') || '';
      if (savedEmail) {
        setFormData({ email: savedEmail, password: '', name: '' });
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
    // Limpiar datos de autenticación usando Zustand
    authManager.clearAuthData();
    
    // Limpiar cookies
    document.cookie = 'userRole=; path=/; max-age=0';
    document.cookie = 'auth_token=; path=/; max-age=0';
    
    // Limpiar carrito
    clearCartOnLogout();
    
    // Redirigir
    window.location.href = '/';
  };
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  // Función para convertir errores técnicos en mensajes amigables
  const getErrorMessage = (error, isLoginMode) => {
    const errorMessage = error.message || error.detail || error;
    
    // Errores de red/conexión
    if (errorMessage.includes('fetch') || errorMessage.includes('Network')) {
      return 'Sin conexión a internet. Verifica tu conexión e inténtalo de nuevo.';
    }
      // Errores de Firebase Auth
    if (errorMessage.includes('INVALID_PASSWORD') || errorMessage.includes('EMAIL_NOT_FOUND')) {
      return 'Email o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.';
    }
    
    if (errorMessage.includes('WEAK_PASSWORD')) {
      return 'La contraseña es muy débil. Debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.';
    }
    
    if (errorMessage.includes('EMAIL_EXISTS') || errorMessage.includes('already exists')) {
      return 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.';
    }
    
    if (errorMessage.includes('INVALID_EMAIL')) {
      return 'El formato del email no es válido. Verifica que esté escrito correctamente.';
    }
    
    if (errorMessage.includes('TOO_MANY_ATTEMPTS')) {
      return 'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentarlo de nuevo.';
    }
    
    if (errorMessage.includes('USER_DISABLED')) {
      return 'Esta cuenta ha sido deshabilitada. Contacta al soporte para más información.';
    }
    
    if (errorMessage.includes('OPERATION_NOT_ALLOWED')) {
      return 'Este método de autenticación no está habilitado. Contacta al soporte.';
    }
    
    // Errores de Google Auth
    if (errorMessage.includes('popup_closed_by_user')) {
      return 'Has cerrado la ventana de Google. Inténtalo de nuevo si quieres autenticarte con Google.';
    }
    
    if (errorMessage.includes('access_denied')) {
      return 'Has denegado el acceso a tu cuenta de Google. Necesitamos permisos para crear tu cuenta.';
    }
    
    if (errorMessage.includes('CREDENTIAL_TOO_OLD')) {
      return 'Tu sesión de Google ha expirado. Inténtalo de nuevo.';
    }
    
    // Errores de servidor HTTP
    if (errorMessage.includes('400')) {
      return isLoginMode 
        ? 'Datos de inicio de sesión inválidos. Verifica tu email y contraseña.'
        : 'Datos de registro inválidos. Revisa que todos los campos estén correctos.';
    }
    
    if (errorMessage.includes('401')) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    }
    
    if (errorMessage.includes('403')) {
      return 'Acceso denegado. No tienes permisos para realizar esta acción.';
    }
    
    if (errorMessage.includes('409')) {
      return 'Este email ya está registrado. Intenta iniciar sesión en su lugar.';
    }
    
    if (errorMessage.includes('422')) {
      return isLoginMode
        ? 'Los datos proporcionados no son válidos. Verifica tu email y contraseña.'
        : 'Los datos de registro no son válidos. Asegúrate de que la contraseña cumpla todos los requisitos.';
    }
    
    if (errorMessage.includes('429')) {
      return 'Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.';
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      return 'Error del servidor. Por favor, inténtalo de nuevo en unos momentos.';
    }
    
    if (errorMessage.includes('503')) {
      return 'Servicio temporalmente no disponible. Inténtalo de nuevo más tarde.';
    }
    
    // Errores específicos de validación de contraseña
    if (errorMessage.includes('contraseña') && errorMessage.includes('requisitos')) {
      return 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo especial.';
    }
    
    // Errores de campos requeridos
    if (errorMessage.includes('required') || errorMessage.includes('requerido')) {
      return 'Por favor, completa todos los campos obligatorios.';
    }
    
    // Error genérico pero amigable
    return isLoginMode 
      ? 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.'
      : 'No se pudo completar el registro. Verifica tus datos e inténtalo de nuevo.';
  };// Centraliza la gestión de sesión para ambos flujos
  const handleAuthSuccess = (data) => {
    console.log('AuthModal: handleAuthSuccess llamado con data:', data);
    authManager.setAuthData(data);
    onLoginSuccess?.(data.email, data.nombre || data.email, data.uid);
    
    // Mensaje específico según si es registro o login
    const isRegistration = data.message && data.message.includes('registrado');
    const successMessage = isRegistration 
      ? '¡Registro exitoso! Bienvenido a la plataforma!'
      : '¡Inicio de sesión exitoso!';
    
    showNotification(successMessage, 'success');
    
    // Si es admin, redirigir directamente al dashboard
    if (data.role === 'admin') {
      console.log('AuthModal: Usuario admin detectado, redirigiendo al dashboard...');
      setTimeout(() => {
        console.log('AuthModal: Ejecutando redirección a /admin/dashboard');
        window.location.href = '/admin/dashboard';
      }, 1000); // Aumenté el tiempo a 1 segundo para que sea más visible
      return;
    }
    
    onClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validaciones de formulario
    if (!formData.email || !formData.password) {
      const errorMsg = 'Por favor, completa todos los campos obligatorios.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const errorMsg = 'Por favor, introduce un email válido.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setIsLoading(false);
      return;
    }

    // Validar contraseña solo en registro
    if (!isLoginMode && !validatePassword(formData.password)) {
      const errorMsg = 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo especial.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setShowPasswordErrors(true);
      setIsLoading(false);
      return;
    }

    // Validar nombre en registro
    if (!isLoginMode && !formData.name?.trim()) {
      const errorMsg = 'Por favor, introduce tu nombre.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setIsLoading(false);
      return;
    }

    try {      const endpoint = isLoginMode 
        ? 'http://localhost:8000/auth/login'
        : 'http://localhost:8000/auth/register';      const requestBody = {
        email: formData.email,
        password: formData.password,
        ...(isLoginMode ? {} : formData.name ? { nombre: formData.name } : {})
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la autenticación');
      }

      // Guardar email si el usuario marcó 'Recordarme' SOLO en login
      if (isLoginMode && rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else if (isLoginMode) {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }      handleAuthSuccess(data);
    } catch (err) {
      console.error('Error en autenticación:', err);
      
      // Usar la función de manejo de errores amigables
      const userFriendlyError = getErrorMessage(err, isLoginMode);
      
      setError(userFriendlyError);
      showNotification(userFriendlyError, 'error');
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
    
    // Validar contraseña
    if (!validatePassword(resetForm.password)) {
      setResetErrors(prev => ({
        ...prev,
        password: 'La contraseña no cumple con los requisitos mínimos'
      }));
      return;
    }
    
    if (Object.keys(errors).length > 0) return;
    setResetLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/auth/direct-reset-password', {
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
      const loginResponse = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetForm.email,
          password: resetForm.password
        })
      });      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.detail || 'Contraseña cambiada, pero error al iniciar sesión');
      
      // Usar authManager en lugar de localStorage
      authManager.setAuthData(loginData);
      
      showNotification('Contraseña actualizada e inicio de sesión exitoso', 'success');
      setShowResetPassword(false);
      setResetForm({ email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        onClose();
        window.location.reload();      }, 1500);
    } catch (err) {
      console.error('Error en reset de contraseña:', err);
      
      // Usar la función de manejo de errores amigables
      const userFriendlyError = getErrorMessage(err, true); // true porque después hace login
      
      setError(userFriendlyError);
      showNotification(userFriendlyError, 'error');
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
                    : authManager.isAuthenticated() 
                      ? 'Tu Cuenta' 
                      : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </h2>
                <p className="text-gray-600 text-base">
                  {showResetPassword
                    ? 'Introduce tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.'
                    : authManager.isAuthenticated() 
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
                    <PasswordRequirements 
                      password={resetForm.password} 
                      showErrors={!!resetErrors.password} 
                    />
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
                authManager.isAuthenticated() ? (
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
                            onChange={(e) => {
                              handleInputChange(e);
                              setShowPasswordErrors(false);
                            }}
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
                        <PasswordRequirements 
                          password={formData.password} 
                          showErrors={showPasswordErrors} 
                          mostrar={!isLoginMode}
                        />
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
                    </div>                    <div className="mb-4 flex justify-center">
                      <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                          const id_token = credentialResponse.credential;
                          if (!id_token) {
                            const errorMsg = 'No se pudo obtener la autorización de Google. Inténtalo de nuevo.';
                            setError(errorMsg);
                            showNotification(errorMsg, 'error');
                            return;
                          }
                          try {
                            setIsLoading(true);
                            const data = await apiManager.post('/auth/google', { id_token });
                            handleAuthSuccess(data);
                          } catch (error) {
                            console.error('Error en Google Auth:', error);
                            const userFriendlyError = getErrorMessage(error, false); // false para Google Auth
                            setError(userFriendlyError);
                            showNotification(userFriendlyError, 'error');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        onError={(error) => {
                          console.error('Google Login Error:', error);
                          const errorMsg = 'No se pudo conectar con Google. Verifica tu conexión e inténtalo de nuevo.';
                          setError(errorMsg);
                          showNotification(errorMsg, 'error');
                        }}
                      />
                    </div>
                  </>
                )
              )}

              {!authManager.isAuthenticated() && (
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