import { useState, useEffect } from 'react';

export default function useAuthUser() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Solo en cliente
    if (typeof window !== 'undefined') {
      setUid(localStorage.getItem('uid'));
      const onStorage = () => setUid(localStorage.getItem('uid'));
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }
  }, []);

  return uid;
} 