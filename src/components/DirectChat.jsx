import React, { useState, useEffect, useRef } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';

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

  if (loading && messages.length === 0) return <div>Cargando chat...</div>;
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && !error && (
          <div className="text-gray-400 text-center py-8">
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
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Formulario de envío */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={sendLoading || !input.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {sendLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectChat; 