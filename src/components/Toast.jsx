import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };  return (
    <div className="fixed left-1/2 bottom-8 z-[9999] transform -translate-x-1/2 animate-slide-up" style={{ zIndex: 9999 }}>
      <div
        className={`flex items-center p-4 rounded-lg shadow-2xl border-2 ${getBackgroundColor()} max-w-md min-w-[300px] cursor-pointer`}
        onClick={onClose}
        style={{ zIndex: 9999 }}
      >
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 text-gray-800 font-medium">
          {message}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <FaTimesCircle />
        </button>
      </div>
    </div>
  );
};

export default Toast; 