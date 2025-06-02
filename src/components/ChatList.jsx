import React, { useState, useEffect } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const loadChats = async () => {
      try {
        const userChats = await directChatManager.getChats();
        setChats(userChats);
        const currentUid = authManager.getUser()?.uid;
        const ids = userChats.map(chat => chat.participants.find(id => id !== currentUid));
        const uniqueIds = [...new Set(ids)];
        const namesObj = {};
        await Promise.all(uniqueIds.map(async (uid) => {
          try {
            const userData = await apiManager.getUserByUid(uid);
            namesObj[uid] = userData.nombre || userData.email || uid;
          } catch {
            namesObj[uid] = uid;
          }
        }));
        setUserNames(namesObj);
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
            className="p-4 border rounded-2xl cursor-pointer bg-white shadow-sm hover:bg-purple-50 hover:shadow-md transition-all duration-200"
            onClick={() => onSelectChat(chat.id, otherParticipantId)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-purple-700">
                  {userNames[otherParticipantId] || otherParticipantId}
                </h3>
                {chat.last_message && (
                  <p className="text-sm text-gray-500 mt-1">
                    {chat.last_message.content}
                  </p>
                )}
              </div>
              {chat.last_message && (
                <span className="text-xs text-purple-400 font-semibold">
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