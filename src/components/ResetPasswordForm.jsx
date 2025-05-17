import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';
import useFormValidation from '../hooks/useFormValidation';
import { validatePassword, validateEmail } from '../utils/validation';
import Toast from './Toast';

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  const validate = (values) => {
    const errors = {};
    
    // Validar email
    if (!values.email) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(values.email)) {
      errors.email = 'El email no es válido';
    }
    
    // Validar contraseña
    const passwordErrors = validatePassword(values.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0];
    }

    // Validar confirmación de contraseña
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Por favor, confirma tu contraseña';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  } = useFormValidation(
    {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate
  );

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const onSubmit = async (values) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/direct-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          newPassword: values.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al actualizar la contraseña');
      }

      showNotification('Contraseña actualizada con éxito', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              placeholder="tu@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 text-lg ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Procesando...' : 'Actualizar Contraseña'}
        </button>
      </form>

      <Toast
        isOpen={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ResetPasswordForm; 