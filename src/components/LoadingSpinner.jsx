import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin" width="80" height="80" viewBox="0 0 50 50" aria-label="Cargando...">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#f7e9fe" // morado muy claro (tailwind: purple-100)
            strokeWidth="4"
          />
          <path
            fill="none"
            stroke="#6366f1" // morado anterior (indigo-500/purple-600)
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="25"
            d="M25 5
              a 20 20 0 0 1 0 40
              a 20 20 0 0 1 0 -40"
          />
        </svg>
        {/* <p className="text-purple-600 font-medium">Cargando...</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner; 