import React, { useState, useEffect } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';
import { FaSpinner } from 'react-icons/fa';

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <FaSpinner className="animate-spin text-purple-500 text-3xl mb-4" />
      <span className="text-purple-500 text-lg font-semibold">Cargando chats...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center animate-fade-in">
        <span className="text-red-400 text-5xl mb-2">
          <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='48' height='48' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
        </span>
        <span className="text-red-500 text-xl font-semibold mb-1">¡Ups! No se pudieron cargar tus chats</span>
        <span className="text-red-400 text-base text-center">Por favor, revisa tu conexión o inténtalo de nuevo más tarde.</span>
      </div>
    </div>
  );

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
                <h3 className="font-bold text-lg text-black-700">
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