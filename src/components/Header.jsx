import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow-md">
      <div className="text-xl font-bold">Logo</div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          placeholder="Buscar..." 
          className="px-3 py-2 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="p-2 rounded-md bg-blue-600 hover:bg-blue-700">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
        
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">Iniciar sesión</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">Registrarse</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
