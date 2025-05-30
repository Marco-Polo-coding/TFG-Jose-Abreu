import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { validateEmail, validateName, validatePassword } from '../utils/validation';
import { FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';
import { getMetodosPago, saveMetodoPago, deleteMetodoPago } from '../utils/api';
import { apiManager } from '../utils/apiManager';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const paymentMethods = [
  { value: 'tarjeta', label: 'Tarjeta', icon: <FaCreditCard className="inline mr-2" /> },
  { value: 'paypal', label: 'PayPal', icon: <FaPaypal className="inline mr-2" /> },
  { value: 'bizum', label: 'Bizum', icon: <FaMoneyBillWave className="inline mr-2" /> },
];

const initialForms = {
  tarjeta: { numero: '', titular: '', caducidad: '', cvc: '' },
  paypal: { email: '' },
  bizum: { telefono: '' },
};

function validateForm(tipo, datos) {
  if (tipo === 'tarjeta') {
    return datos.numero && datos.titular && datos.caducidad && datos.cvc;
  }
  if (tipo === 'paypal') {
    return datos.email && /.+@.+\..+/.test(datos.email);
  }
  if (tipo === 'bizum') {
    return datos.telefono && /^\d{9}$/.test(datos.telefono);
  }
  return false;
}

const EditProfileForm = () => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    foto: null,
    fotoPreview: '',
    biografia: '',
    deletePhoto: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('tarjeta');
  const [paymentForm, setPaymentForm] = useState(initialForms['tarjeta']);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [metodosGuardados, setMetodosGuardados] = useState({});

  useEffect(() => {
    // Cargar datos actuales del usuario
    const nombre = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const foto = localStorage.getItem('userPhoto') || '';
    const biografia = localStorage.getItem('userBio') || '';
    setForm(f => ({ ...f, nombre, email, fotoPreview: foto, biografia }));

    // Cargar métodos de pago guardados
    const uid = localStorage.getItem('uid');
    if (uid) {
      getMetodosPago(uid).then(data => {
        setMetodosGuardados(data || {});
        // Si hay alguno guardado, selecciona el primero
        const tipos = Object.keys(data || {});
        if (tipos.length > 0) {
          setSelectedMethod(tipos[0]);
          setPaymentForm({ ...initialForms[tipos[0]], ...data[tipos[0]] });
        }
      });
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.nombre) errs.nombre = 'El nombre es requerido';
    else {
      const nameErrs = validateName(form.nombre);
      if (nameErrs.length > 0) errs.nombre = nameErrs[0];
    }
    if (!form.email) errs.email = 'El email es requerido';
    else if (!validateEmail(form.email)) errs.email = 'El email no es válido';
    if (form.foto && form.foto.size > MAX_IMAGE_SIZE) errs.foto = 'La imagen supera los 10MB';
    if (form.foto && !['image/png','image/jpeg','image/jpg','image/gif'].includes(form.foto.type)) errs.foto = 'Tipo de imagen no soportado';
    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, foto: file }));
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, fotoPreview: ev.target.result }));
      reader.readAsDataURL(file);
    } else {
      setForm(f => ({ ...f, foto: null, fotoPreview: '' }));
    }
  };

  const handleDeletePhoto = () => {
    setForm(f => ({
      ...f,
      foto: null,
      fotoPreview: '',
      deletePhoto: true
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const uid = localStorage.getItem('uid');
      const formData = new FormData();
      formData.append('uid', uid);
      formData.append('nombre', form.nombre);
      formData.append('email', form.email);
      formData.append('biografia', form.biografia);
      if (form.foto) formData.append('foto', form.foto);
      if (form.deletePhoto) formData.append('delete_photo', 'true');
      
      const data = await apiManager.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizar localStorage
      localStorage.setItem('userName', form.nombre);
      localStorage.setItem('userEmail', form.email);
      if (data.data && data.data.biografia !== undefined) {
        localStorage.setItem('userBio', data.data.biografia);
      }
      if (form.deletePhoto) {
        localStorage.removeItem('userPhoto');
      } else if (data.data && data.data.foto) {
        localStorage.setItem('userPhoto', data.data.foto);
      }
      setToast({ open: true, message: 'Perfil actualizado con éxito', type: 'success' });
      setTimeout(() => window.location.href = '/profile', 1200);
    } catch (err) {
      setToast({ open: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errs = {};
    const passwordErrs = validatePassword(passwordForm.password);
    if (!passwordForm.password) errs.password = 'La contraseña es requerida';
    else if (passwordErrs.length > 0) errs.password = passwordErrs[0];
    if (!passwordForm.confirmPassword) errs.confirmPassword = 'Confirma tu contraseña';
    else if (passwordForm.password !== passwordForm.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    return errs;
  };

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordForm(f => ({ ...f, [name]: value }));
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    const errs = validatePasswordForm();
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPasswordLoading(true);
    try {
      const email = localStorage.getItem('userEmail');
      await apiManager.post('/auth/direct-reset-password', {
        email,
        newPassword: passwordForm.password
      });
      setToast({ open: true, message: 'Contraseña actualizada con éxito', type: 'success' });
      setPasswordForm({ password: '', confirmPassword: '' });
    } catch (err) {
      setToast({ open: true, message: err.message, type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const uid = localStorage.getItem('uid');
      const email = localStorage.getItem('userEmail');
      
      // Verificar que los datos coinciden con el usuario actual
      if (!uid || !email) {
        throw new Error('No se encontraron los datos del usuario');
      }

      await apiManager.delete('/auth/delete-account', {
        uid,
        email
      });
      
      // Limpiar localStorage
      localStorage.clear();
      
      setToast({ open: true, message: 'Cuenta eliminada con éxito', type: 'success' });
      setTimeout(() => window.location.href = '/', 1200);
    } catch (err) {
      setToast({ open: true, message: err.message, type: 'error' });
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    setSelectedMethod(value);
    setPaymentForm(metodosGuardados[value] ? { ...initialForms[value], ...metodosGuardados[value] } : initialForms[value]);
    setPaymentSaved(false);
    setPaymentError('');
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
    setPaymentSaved(false);
    setPaymentError('');
  };

  const handleSavePaymentMethod = async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      await saveMetodoPago(uid, selectedMethod, paymentForm);
      setMetodosGuardados(prev => ({ ...prev, [selectedMethod]: paymentForm }));
      setPaymentSaved(true);
    } catch (err) {
      setPaymentError('Error al guardar el método de pago');
    }
    setPaymentLoading(false);
  };

  const handleDeletePaymentMethod = async (tipo) => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;
    setPaymentLoading(true);
    try {
      await deleteMetodoPago(uid, tipo);
      setMetodosGuardados(prev => {
        const nuevo = { ...prev };
        delete nuevo[tipo];
        return nuevo;
      });
      if (selectedMethod === tipo) {
        setSelectedMethod('tarjeta');
        setPaymentForm(initialForms['tarjeta']);
      }
    } catch (err) {
      setPaymentError('Error al eliminar el método de pago');
    }
    setPaymentLoading(false);
  };

  return (
    <form className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Tu nombre" required />
        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Tu email" required />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-2 text-center w-full flex flex-col items-center justify-center">
            {form.fotoPreview ? (
              <div className="relative">
                <img src={form.fotoPreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                >
                  ×
                </button>
              </div>
            ) : (
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H20a2 2 0 00-2 2v2H8a2 2 0 00-2 2v24a2 2 0 002 2h32a2 2 0 002-2V14a2 2 0 00-2-2h-10v-2a2 2 0 00-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="24" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 block">
              <span>Subir una imagen</span>
              <input type="file" accept="image/*" className="sr-only" onChange={handleImage} />
            </label>
            <span className="text-gray-500">o arrastra y suelta</span>
            <span className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</span>
            {errors.foto && <p className="text-red-600 text-sm mt-1">{errors.foto}</p>}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
        <textarea
          name="biografia"
          value={form.biografia}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Cuéntanos algo sobre ti..."
          rows={3}
          maxLength={300}
        />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <a href="/profile" className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</a>
        <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
      <hr className="my-8" />
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Cambiar contraseña</h3>
        <form className="space-y-4" onSubmit={handlePasswordSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={passwordForm.password}
                onChange={handlePasswordChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.221 1.125-4.575m1.75-2.425A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.221-1.125 4.575m-1.75 2.425A9.956 9.956 0 0112 21c-1.657 0-3.221-.403-4.575-1.125" /></svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </button>
            </div>
            {passwordErrors.password && <p className="text-red-600 text-sm mt-1">{passwordErrors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onMouseDown={() => setShowConfirmPassword(true)}
                onMouseUp={() => setShowConfirmPassword(false)}
                onMouseLeave={() => setShowConfirmPassword(false)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.221 1.125-4.575m1.75-2.425A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.221-1.125 4.575m-1.75 2.425A9.956 9.956 0 0112 21c-1.657 0-3.221-.403-4.575-1.125" /></svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={passwordLoading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 disabled:opacity-50">
            {passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
      <hr className="my-8" />
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Método de pago</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un método de pago</label>
            <div className="flex gap-4 mb-4">
              {paymentMethods.map(method => (
                <label key={method.value} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 ${selectedMethod === method.value ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white hover:bg-gray-100'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={selectedMethod === method.value}
                    onChange={handlePaymentMethodChange}
                    className="form-radio text-purple-600"
                  />
                  {method.icon}
                  <span>{method.label}</span>
                  {metodosGuardados[method.value] && (
                    <button
                      type="button"
                      title="Eliminar método"
                      className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                      onClick={e => { e.stopPropagation(); handleDeletePaymentMethod(method.value); }}
                      disabled={paymentLoading}
                    >
                      Eliminar
                    </button>
                  )}
                </label>
              ))}
            </div>
          </div>
          <div>
            {selectedMethod === 'tarjeta' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="numero" value={paymentForm.numero} onChange={handlePaymentInputChange} placeholder="Número de tarjeta" className="border rounded-lg px-4 py-2" maxLength={19} />
                <input type="text" name="titular" value={paymentForm.titular} onChange={handlePaymentInputChange} placeholder="Titular" className="border rounded-lg px-4 py-2" />
                <input type="text" name="caducidad" value={paymentForm.caducidad} onChange={handlePaymentInputChange} placeholder="MM/AA" className="border rounded-lg px-4 py-2" maxLength={5} />
                <input type="text" name="cvc" value={paymentForm.cvc} onChange={handlePaymentInputChange} placeholder="CVC" className="border rounded-lg px-4 py-2" maxLength={4} />
              </div>
            )}
            {selectedMethod === 'paypal' && (
              <input type="email" name="email" value={paymentForm.email} onChange={handlePaymentInputChange} placeholder="Email de PayPal" className="border rounded-lg px-4 py-2 w-full" />
            )}
            {selectedMethod === 'bizum' && (
              <input type="text" name="telefono" value={paymentForm.telefono} onChange={handlePaymentInputChange} placeholder="Teléfono Bizum" className="border rounded-lg px-4 py-2 w-full" maxLength={9} />
            )}
          </div>
          {paymentError && <p className="text-red-500 mb-4">{paymentError}</p>}
          <div>
            <button type="button" onClick={handleSavePaymentMethod} disabled={paymentLoading || !validateForm(selectedMethod, paymentForm)} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
              {paymentLoading ? 'Guardando...' : paymentSaved ? 'Método guardado' : metodosGuardados[selectedMethod] ? 'Actualizar método de pago' : 'Guardar método de pago'}
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {Object.entries(metodosGuardados).length > 0 && (
              <div className="text-sm text-gray-600 font-semibold mb-1">Métodos guardados:</div>
            )}
            {Object.entries(metodosGuardados).map(([tipo, datos]) => (
              <div key={tipo} className="flex items-center gap-2 text-gray-700 bg-purple-50 rounded px-3 py-2 text-sm">
                <span className="capitalize font-bold">{tipo}</span>
                <span className="text-gray-500">{tipo === 'tarjeta' && datos.numero ? `•••• ${datos.numero.slice(-4)}` : tipo === 'paypal' && datos.email ? datos.email : tipo === 'bizum' && datos.telefono ? datos.telefono : ''}</span>
                <button
                  type="button"
                  className="ml-auto text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                  onClick={() => handleDeletePaymentMethod(tipo)}
                  disabled={paymentLoading}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <hr className="my-8" />
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-red-600 mb-2">Eliminar cuenta</h3>
        <p className="text-gray-600">
          {showDeleteConfirm 
            ? "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se eliminarán todos tus datos, artículos y productos."
            : "Al eliminar tu cuenta, se eliminarán permanentemente todos tus datos, artículos y productos."}
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className={`w-full py-2 px-4 rounded-full font-semibold shadow transition-all duration-200 ${
            showDeleteConfirm
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          } disabled:opacity-50`}
        >
          {deleteLoading 
            ? 'Eliminando...' 
            : showDeleteConfirm 
              ? 'Sí, eliminar mi cuenta' 
              : 'Eliminar cuenta'}
        </button>
        {showDeleteConfirm && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="w-full py-2 px-4 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
      <Toast isOpen={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, open: false }))} />
    </form>
  );
};

export default EditProfileForm; 