import React, { useState, useEffect, useRef } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';
import { FaSpinner } from 'react-icons/fa';

const DirectChat = ({ chatId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Cargar información del otro usuario (simulada, ya que no hay acceso directo a Firestore)
  useEffect(() => {
    const loadOtherUser = async () => {
      try {
        // Obtener la info real del usuario desde el backend
        const userData = await apiManager.getUserByUid(otherUserId);
        setOtherUser({ name: userData.nombre || userData.email || otherUserId });
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        setOtherUser({ name: otherUserId }); // fallback al UID
      }
    };
    if (otherUserId) {
      loadOtherUser();
    }
  }, [otherUserId]);

  // Función reutilizable para cargar mensajes
  const loadMessages = async () => {
    try {
      const chatMessages = await directChatManager.getMessages(chatId);
      setMessages(chatMessages.reverse());
      setError(null);
    } catch (err) {
      setError('Error al cargar los mensajes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes iniciales
  useEffect(() => {
    if (chatId) {
      setLoading(true);
      loadMessages();
    }
    // eslint-disable-next-line
  }, [chatId]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sendLoading) return;
    setSendLoading(true);
    try {
      await directChatManager.sendMessage(chatId, input.trim());
      setInput('');
      await loadMessages();
      setError(null);
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
    } finally {
      setSendLoading(false);
    }
  };

  if (loading && messages.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <FaSpinner className="animate-spin text-purple-500 text-4xl mb-4" />
      <span className="text-purple-500 text-lg font-semibold">Cargando chat...</span>
    </div>
  );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera del chat */}
      <div className="p-4 border-b">
        <h2 className="font-medium">
          {otherUser?.name || 'Usuario'}
        </h2>
      </div>
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-purple-50 rounded-b-xl">
        {messages.length === 0 && !loading && !error && (
          <div className="text-gray-400 text-center py-8 italic text-lg">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        )}
        {messages.map((message) => {
          const isOwn = message.sender === authManager.getUser()?.uid;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 shadow-md mb-2 break-words whitespace-pre-line transition-all duration-200 ${
                  isOwn
                    ? 'bg-purple-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none border border-purple-100'
                }`}
              >
                <p className="mb-1 text-base">{message.content}</p>
                <span className="text-xs opacity-70 block text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Formulario de envío */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 text-gray-800 shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={sendLoading || !input.trim() || loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
        >
          {sendLoading ? <FaSpinner className="animate-spin" /> : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default DirectChat; 