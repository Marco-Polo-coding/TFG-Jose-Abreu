import React, { useState, useEffect } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';
import { FaSpinner, FaEllipsisV, FaSignOutAlt } from 'react-icons/fa';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { wsChatManager } from '../utils/wsChatManager';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = React.useRef(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [chatToLeave, setChatToLeave] = useState(null);  const loadChats = async () => {
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

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  useEffect(() => {
    const handleWSMessage = (data) => {
      loadChats();
    };
    const handleWSRead = (data) => {
      loadChats();
    };
    wsChatManager.on('message', handleWSMessage);
    wsChatManager.on('read', handleWSRead);
    return () => {
      wsChatManager.off('message', handleWSMessage);
      wsChatManager.off('read', handleWSRead);
    };
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

  if (!chats.length) return (
    <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
      <span className="text-purple-300 text-6xl mb-4">
        <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='64' height='64' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m-4 8h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
      </span>
      <span className="text-purple-400 text-2xl font-bold mb-2">No tienes chats activos</span>
      <span className="text-gray-400 text-base text-center">¡Cuando inicies una conversación aparecerá aquí!</span>
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
            className="relative p-4 border rounded-2xl cursor-pointer bg-white shadow-sm hover:bg-purple-50 hover:shadow-md transition-all duration-200"
            onClick={() => onSelectChat(chat.id, otherParticipantId)}
          >
            <button
              className="absolute top-2 right-2 text-purple-400 hover:text-purple-600 z-10"
              onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
              title="Opciones"
            >
              <FaEllipsisV />
            </button>
            {menuOpenId === chat.id && (
              <div
                ref={menuRef}
                className="absolute top-10 right-2 bg-white text-gray-800 rounded-xl shadow-lg border border-purple-100 py-2 w-40 animate-fade-in z-20"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="flex items-center w-full px-4 py-2 hover:bg-red-50 transition-colors gap-2 text-left"
                  onClick={() => { setMenuOpenId(null); setChatToLeave(chat); setShowLeaveModal(true); }}
                >
                  <FaSignOutAlt className="text-red-500" /> Salir del chat
                </button>
              </div>
            )}
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
              </div>              {chat.last_message && (
                <span className="text-xs text-purple-400 font-semibold">
                  {new Date(chat.last_message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <ConfirmDeleteModal
        open={showLeaveModal}
        onClose={() => { setShowLeaveModal(false); setChatToLeave(null); }}
        onConfirm={async () => {
          if (chatToLeave) {
            await directChatManager.leaveChat(chatToLeave.id);
            setShowLeaveModal(false);
            setChatToLeave(null);
            window.location.href = '/chat';
          }
        }}
        articleTitle={chatToLeave ? (userNames[chatToLeave.participants.find(id => id !== authManager.getUser()?.uid)] || chatToLeave.id) : ''}
        title="¿Salir del chat?"
        message="¿Seguro que quieres salir de este chat? Ya no aparecerá en tu lista."
      />
    </div>
  );
};

export default ChatList; 