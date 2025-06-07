import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaBars, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaCheck } from 'react-icons/fa';
// import LoadingSpinner from './LoadingSpinner';
import { authManager } from '../utils/authManager';
import { chatManager } from '../utils/chatManager';
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
  const [view, setView] = useState('chat'); // 'chat' o 'history'
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Manejo de teclas para cerrar el chat con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Enfocar el input cuando se abre el chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const userMessage = {
      type: 'user',
      content: trimmedInput
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
      // Guardar mensaje del usuario en el historial del chat si hay chat seleccionado
      if (selectedChatId) {
        try {
          await chatManager.addMessage(selectedChatId, {
            role: 'user',
            content: trimmedInput
          });
        } catch (authError) {
          console.warn('No se pudo guardar el mensaje en el historial:', authError);
          // Continuar sin interrumpir el flujo del chat
        }
      }
      const data = await chatManager.sendMessage(trimmedInput, history);
      const assistantMessage = {
        type: 'assistant',
        content: data.response || 'El asistente no está disponible ahora mismo. Por favor, contacta con soporte en info@crpghub.com.'
      };
      setMessages(prev => [...prev, assistantMessage]);
      // Guardar respuesta del asistente en el historial del chat si hay chat seleccionado
      if (selectedChatId) {
        try {
          await chatManager.addMessage(selectedChatId, {
            role: 'assistant',
            content: assistantMessage.content
          });
        } catch (authError) {
          console.warn('No se pudo guardar la respuesta en el historial:', authError);
          // Continuar sin interrumpir el flujo del chat
        }
      }
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
      // Limpiar el chat seleccionado anterior
      setSelectedChatId(null);
      const newChat = await chatManager.createChat(null, [
        {
          role: 'assistant',
          content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
        }
      ]);
      setMessages([
        {
          type: 'assistant',
          content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
        }
      ]);
      setSelectedChatId(newChat.id); // Vincular el nuevo chat con la conversación
      setInput('');
    } catch (error) {
      setToastMessage('No se pudo crear un nuevo chat. Inténtalo de nuevo.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const fetchChats = async () => {
    if (!authManager.isAuthenticated()) return;
    setLoadingChats(true);
    try {
      const data = await chatManager.getChats();
      setChats(data);
    } catch (error) {
      setToastMessage('No se pudo cargar el historial de chats.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleOpenHistory = () => {
    if (!authManager.isAuthenticated()) {
      setToastMessage('Debes iniciar sesión para ver el historial de chats.');
      setToastType('info');
      setShowToast(true);
      return;
    }
    setView('history');
    fetchChats();
  };

  const handleSelectChat = async (chatId) => {
    try {
      const data = await chatManager.getChat(chatId);
      // Mapear mensajes: convertir 'role' a 'type'
      const mappedMessages = (data.messages || []).map(m => ({
        type: m.role,
        content: m.content
      }));
      setMessages(mappedMessages);
      setSelectedChatId(chatId);
      setView('chat');
    } catch (error) {
      setToastMessage('No se pudo cargar el chat seleccionado.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteChat = (chatId) => {
    setChatIdToDelete(chatId);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatIdToDelete) return;
    try {
      await chatManager.deleteChat(chatIdToDelete);
      setChats(chats.filter(c => c.id !== chatIdToDelete));
      if (selectedChatId === chatIdToDelete) {
        setMessages([
          {
            type: 'assistant',
            content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
          }
        ]);
        setSelectedChatId(null);
      }
      setToastMessage('Chat borrado correctamente.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('No se pudo borrar el chat.');
      setToastType('error');
      setShowToast(true);
      // Refrescar la lista para mantener consistencia
      fetchChats();
    } finally {
      setShowDeleteModal(false);
      setChatIdToDelete(null);
    }
  };

  const cancelDeleteChat = () => {
    setShowDeleteModal(false);
    setChatIdToDelete(null);
  };

  const handleRenameChat = async (chatId) => {
    try {
      await chatManager.renameChat(chatId, renameValue);
      setChats(chats.map(c => c.id === chatId ? { ...c, name: renameValue } : c));
      setRenamingChatId(null);
      setRenameValue('');
      setToastMessage('Chat renombrado correctamente.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('No se pudo renombrar el chat.');
      setToastType('error');
      setShowToast(true);
      // Refrescar la lista en caso de error para mantener consistencia
      fetchChats();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Botón flotante del asistente */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${getButtonPosition()} right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${getZIndex()}`}
        aria-label="Abrir asistente virtual"
        title="Abrir asistente virtual"
      >
        <FaRobot className="w-6 h-6" aria-hidden="true" />
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
            bg-white rounded-t-2xl rounded-b-2xl shadow-2xl flex flex-col ${getZIndex()}`}
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
              onClick={handleOpenHistory}
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

          {/* Vista de historial de chats */}
          {view === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-2xl overflow-hidden">
              <div className="flex items-center mb-4">
                <button
                  className="mr-2 text-purple-600 hover:text-purple-800 p-2 rounded-full focus:outline-none"
                  onClick={() => setView('chat')}
                  title="Volver al chat"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-semibold text-gray-700">Historial de chats</h4>
              </div>
              {loadingChats ? (
                <div className="flex justify-center items-center h-32">
                  <FaSpinner className="animate-spin w-6 h-6 text-purple-500" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {chats.length === 0 && (
                    <li className="text-gray-500">No tienes chats guardados.</li>
                  )}
                  {chats.map(chat => (
                    <li key={chat.id} className="bg-white rounded-xl shadow p-3 flex items-center justify-between group transition hover:shadow-lg">
                      <div className="flex-1 min-w-0">
                        {renamingChatId === chat.id ? (
                          <div className="flex flex-col gap-1">
                            <input
                              className="border rounded px-2 py-1 text-sm flex-1 mb-1"
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-2 mb-4">
                              <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handleRenameChat(chat.id)}
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => { setRenamingChatId(null); setRenameValue(''); }}
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-800 truncate">
                            {chat.name.replace(/(\d{1,2}\/\d{1,2}\/\d{4}),? (\d{1,2}):(\d{2})(?::\d{2})?/g, (match, d, h, m) => `${h}:${m}`)}
                          </span>
                        )}
                        <div className="text-xs text-gray-400">{new Date(chat.updated_at || chat.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Abrir chat"
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <FaRobot className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Renombrar chat"
                          onClick={() => { setRenamingChatId(chat.id); setRenameValue(chat.name); }}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Borrar chat"
                          onClick={() => handleDeleteChat(chat.id)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Vista de chat normal */}
          {view === 'chat' && (
            <>
              {/* Mensajes */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                role="log" 
                aria-label="Conversación con el asistente virtual"
                aria-live="polite"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-3 break-words whitespace-pre-line ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      role={message.type === 'user' ? 'log' : 'status'}
                      aria-label={message.type === 'user' ? 'Tu mensaje' : 'Respuesta del asistente'}
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
                    aria-label="Escribe tu mensaje al asistente virtual"
                    disabled={isLoading}
                    ref={inputRef}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Enviar mensaje"
                  >
                    <FaPaperPlane className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </>
          )}
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

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Eliminar chat?</h2>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar
              <span className="font-semibold text-purple-700"> {chats.find(c => c.id === chatIdToDelete)?.name || 'este chat'}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDeleteChat}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;