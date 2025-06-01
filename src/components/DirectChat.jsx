import React, { useState, useEffect, useRef } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';

const DirectChat = ({ chatId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Cargar información del otro usuario (simulada, ya que no hay acceso directo a Firestore)
  useEffect(() => {
    const loadOtherUser = async () => {
      try {
        // Aquí deberías hacer una petición a tu backend para obtener la info del usuario
        setOtherUser({ name: otherUserId });
      } catch (err) {
        console.error('Error al cargar usuario:', err);
      }
    };
    if (otherUserId) {
      loadOtherUser();
    }
  }, [otherUserId]);

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessages = await directChatManager.getMessages(chatId);
        setMessages(chatMessages.reverse()); // Invertir para mostrar más recientes abajo
      } catch (err) {
        setError('Error al cargar los mensajes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      await directChatManager.sendMessage(chatId, input.trim());
      setInput('');
      // Recargar mensajes después de enviar
      const chatMessages = await directChatManager.getMessages(chatId);
      setMessages(chatMessages.reverse());
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
    } finally {
      setLoading(false);
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
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectChat; 