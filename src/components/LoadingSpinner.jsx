import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        <p className="text-purple-600 font-medium">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 