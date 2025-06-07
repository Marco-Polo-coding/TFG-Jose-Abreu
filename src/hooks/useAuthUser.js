import { useState, useEffect } from 'react';
import { authManager } from '../utils/authManager';

export default function useAuthUser() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Obtener UID del usuario autenticado desde Zustand
    const updateUid = () => {
      const user = authManager.getUser();
      setUid(user?.uid || null);
    };

    // Actualizar estado inicial
    updateUid();

    // Escuchar cambios en el estado de autenticación
    const handleAuthChange = () => {
      updateUid();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

  return uid;
}