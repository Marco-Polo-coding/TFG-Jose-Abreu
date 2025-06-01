import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaBars, FaPlus } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import { authManager } from '../utils/authManager';
import Toast from './Toast';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentPath, setCurrentPath] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Control de visibilidad durante la carga y actualización de la ruta
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Actualizar la ruta actual
    setCurrentPath(window.location.pathname);

    // Escuchar cambios en la ruta
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('astro:page-load', handleRouteChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('astro:page-load', handleRouteChange);
    };
  }, []);

  // Determinar el z-index basado en la ruta
  const getZIndex = () => {
    if (currentPath === '/tienda' || currentPath === '/blog') {
      return 'z-[60]'; // Por encima de los botones flotantes
    }
    return 'z-50'; // Valor por defecto
  };

  // Determinar la posición del botón
  const getButtonPosition = () => {
    if (currentPath === '/tienda' || currentPath === '/blog') {
      return 'bottom-24'; // Por encima de los botones flotantes
    }
    return 'bottom-6'; // Posición por defecto
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .filter(m => m.type === 'user' || m.type === 'assistant')
      .map(m => ({
        role: m.type,
        content: m.content
      }));
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: history
        })
      });
      if (!response.ok) throw new Error('Error en la petición');
      const data = await response.json();
      const assistantMessage = {
        type: 'assistant',
        content: data.response || 'El asistente no está disponible ahora mismo. Por favor, contacta con soporte en info@crpghub.com.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'El asistente no está disponible ahora mismo. Por favor, contacta con soporte en info@crpghub.com.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear un nuevo chat
  const handleNewChat = async () => {
    if (!authManager.isAuthenticated()) {
      setToastMessage('Debes iniciar sesión para crear un nuevo chat.');
      setToastType('info');
      setShowToast(true);
      return;
    }
    try {
      const token = authManager.getToken();
      const response = await fetch('http://localhost:8000/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Error al crear el chat');
      setMessages([
        {
          type: 'assistant',
          content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
        }
      ]);
      setInput('');
    } catch (error) {
      setToastMessage('No se pudo crear un nuevo chat. Inténtalo de nuevo.');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Botón flotante del asistente */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${getButtonPosition()} right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${getZIndex()}`}
      >
        <FaRobot className="w-6 h-6" />
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div
          className={`fixed 
            left-1/2 -translate-x-1/2 
            bottom-0 
            w-[95vw] max-w-full 
            h-[80vh] max-h-[95vh]
            sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-6 
            sm:w-[320px] sm:h-[450px] sm:max-w-[320px] sm:max-h-[450px]
            bg-white rounded-2xl shadow-2xl flex flex-col ${getZIndex()}`}
          style={{
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-2xl flex justify-between items-center relative">
            {/* Botón de historial (hamburguesa) */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10 focus:outline-none"
              title="Ver historial de chats"
              style={{ zIndex: 2 }}
              type="button"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 ml-12">
              <FaRobot className="w-6 h-6 text-white" />
              <h3 className="text-white font-semibold">Asistente Virtual</h3>
            </div>
            {/* Botón de nuevo chat */}
            <button
              className="absolute right-12 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10 focus:outline-none"
              title="Nuevo chat"
              type="button"
              style={{ zIndex: 2 }}
              onClick={handleNewChat}
            >
              <FaPlus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition-colors p-2 rounded-full focus:outline-none"
              style={{ zIndex: 2 }}
              title="Cerrar"
              type="button"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="w-full flex flex-col items-center justify-center py-8">
                  <div className="animate-bounce mb-2">
                    <FaRobot className="w-10 h-10 text-purple-500 opacity-80" />
                  </div>
                  <span className="text-purple-600 font-semibold text-base">El asistente está pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast de notificación */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default VirtualAssistant;