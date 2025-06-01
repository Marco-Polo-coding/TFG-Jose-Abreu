import React, { useState, useEffect } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const userChats = await directChatManager.getChats();
        setChats(userChats);
      } catch (err) {
        setError('Error al cargar los chats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  if (loading) return <div>Cargando chats...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col space-y-2">
      {chats.map((chat) => {
        const otherParticipantId = chat.participants.find(
          (id) => id !== authManager.getUser()?.uid
        );
        
        return (
          <div
            key={chat.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => onSelectChat(chat.id, otherParticipantId)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {otherParticipantId} {/* Aquí irá el nombre del usuario */}
                </h3>
                {chat.last_message && (
                  <p className="text-sm text-gray-500">
                    {chat.last_message.content}
                  </p>
                )}
              </div>
              {chat.last_message && (
                <span className="text-xs text-gray-400">
                  {new Date(chat.last_message.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList; 