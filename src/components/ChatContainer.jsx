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
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-purple-50 to-purple-100 p-6 rounded-3xl shadow-2xl max-w-7xl mx-auto mt-6">
      {/* Lista de chats - 1/3 del ancho */}
      <div className="w-1/3 border-r border-purple-100 pr-4 flex flex-col justify-between">
        <ChatList onSelectChat={handleSelectChat} />
      </div>

      {/* Área de chat - 2/3 del ancho */}
      <div className="w-2/3 pl-4 flex flex-col h-full">
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