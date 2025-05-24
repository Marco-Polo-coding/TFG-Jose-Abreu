import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] ${getBgColor()} rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300 ease-in-out`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className={`${getTextColor()} font-medium`}>{message}</p>
      </div>
    </div>
  );
};

export default Toast; 