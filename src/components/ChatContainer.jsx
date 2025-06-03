import React, { useState } from 'react';
import ChatList from './ChatList';
import DirectChat from './DirectChat';

const ChatContainer = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);

  const handleSelectChat = (chatId, otherId) => {
    setSelectedChat(chatId);
    setOtherUserId(otherId);
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] md:h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-purple-50 to-purple-100 p-2 md:p-6 rounded-none md:rounded-3xl shadow-2xl max-w-full md:max-w-7xl mx-auto mt-0 md:mt-6 overflow-hidden gap-2 md:gap-0">
      {/* Lista de chats - 1/3 del ancho en desktop, 100% en móvil */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-purple-100 pr-0 md:pr-4 flex flex-col justify-between h-1/2 md:h-full bg-white/80 md:bg-transparent">
        <ChatList onSelectChat={handleSelectChat} />
      </div>

      {/* Área de chat - 2/3 del ancho en desktop, 100% en móvil */}
      <div className="w-full md:w-2/3 pl-0 md:pl-4 flex flex-col h-1/2 md:h-full">
        {selectedChat ? (
          <DirectChat chatId={selectedChat} otherUserId={otherUserId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-purple-400">
            <span className="text-6xl mb-4">💬</span>
            <span className="text-2xl font-semibold">Selecciona un chat para comenzar</span>
            <span className="text-base text-gray-400 mt-2">¡Conecta con la comunidad!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 