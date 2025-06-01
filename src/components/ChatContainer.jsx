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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Lista de chats - 1/3 del ancho */}
      <div className="w-1/3 border-r">
        <ChatList onSelectChat={handleSelectChat} />
      </div>

      {/* Área de chat - 2/3 del ancho */}
      <div className="w-2/3">
        {selectedChat ? (
          <DirectChat chatId={selectedChat} otherUserId={otherUserId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecciona un chat para comenzar
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 