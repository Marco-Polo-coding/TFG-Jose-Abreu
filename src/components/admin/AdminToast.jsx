import React, { useState, useEffect } from 'react';
import Toast from '../Toast';

const AdminToast = () => {
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    // Función para mostrar toast desde cualquier componente admin
    const showToast = (event) => {
      const { message, type = 'success' } = event.detail;
      setToast({ open: true, message, type });
    };

    // Escuchar evento personalizado para mostrar toasts
    window.addEventListener('admin-toast', showToast);

    return () => {
      window.removeEventListener('admin-toast', showToast);
    };
  }, []);

  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  if (!toast.open) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={handleClose}
      duration={4000}
    />
  );
};

// Función helper para disparar toasts desde componentes admin
export const showAdminToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('admin-toast', {
    detail: { message, type }
  }));
};

export default AdminToast;
