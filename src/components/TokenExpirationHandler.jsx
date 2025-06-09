import React, { useEffect, useState } from 'react';
import Toast from './Toast';
import TokenExpirationModal from './TokenExpirationModal';

const TokenExpirationHandler = () => {
  const [notifications, setNotifications] = useState([]);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationData, setExpirationData] = useState(null);

  useEffect(() => {    // Manejar advertencia de expiración próxima
    const handleExpirationWarning = (event) => {
      const { message, timeUntilExpiration, onContinue } = event.detail;
      
      setExpirationData({
        message,
        timeUntilExpiration,
        onContinue
      });
      setShowExpirationModal(true);
    };

    // Manejar sesión expirada
    const handleSessionExpired = (event) => {
      const { message } = event.detail;
      addNotification(message, 'error', 5000);
    };

    // Manejar sesión extendida
    const handleSessionExtended = (event) => {
      const { message } = event.detail;
      addNotification(message, 'success', 3000);
    };

    // Agregar listeners de eventos
    window.addEventListener('tokenExpirationWarning', handleExpirationWarning);
    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('sessionExtended', handleSessionExtended);

    // Cleanup listeners
    return () => {
      window.removeEventListener('tokenExpirationWarning', handleExpirationWarning);
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('sessionExtended', handleSessionExtended);
    };
  }, []);

  const addNotification = (message, type, duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleExtendSession = () => {
    if (expirationData?.onContinue) {
      expirationData.onContinue();
    }
    setShowExpirationModal(false);
    setExpirationData(null);
  };

  const handleCloseModal = () => {
    setShowExpirationModal(false);
    setExpirationData(null);
  };
  return (
    <>
      {/* Modal de advertencia de expiración */}
      <TokenExpirationModal
        isOpen={showExpirationModal}
        onClose={handleCloseModal}
        onExtendSession={handleExtendSession}
        timeUntilExpiration={expirationData?.timeUntilExpiration || 0}
      />
      
      {/* Notificaciones Toast */}
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          duration={0} // No auto-close, manejamos manualmente
        />
      ))}
    </>
  );
};

export default TokenExpirationHandler;
