// src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { EnhancedChat } from '../components/EnhancedChat';
import { VideoChat } from '../components/VideoChat';
import useChatStore from '../services/chatState';
import chatService from '../services/chatService';

export function ChatPage() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const unreadMessages = useChatStore(state => state.unreadMessages);
  const typingStatus = useChatStore(state => state.typingStatus);

  useEffect(() => {
    // Inițializează chat-urile active
    const loadChats = async () => {
      const chats = await chatService.getActiveChats();
      setActiveChats(chats);
    };
    loadChats();
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    useChatStore.getState().setCurrentChat(chat.id);
  };

  const handleStartVideoCall = (chatId) => {
    setShowVideoCall(true);
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Lista de chat-uri */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Conversații</h2>
        </div>
        
        <div className="overflow-y-auto">
          {activeChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold truncate">{chat.name}</h3>
                  {unreadMessages[chat.id] > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {unreadMessages[chat.id]}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {typingStatus[chat.id]?.length > 0 
                    ? 'typing...'
                    : chat.lastMessage
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat activ */}
      <div className="flex-1">
        {selectedChat ? (
          <EnhancedChat
            chatId={selectedChat.id}
            userId={1} // Înlocuiți cu ID-ul real al utilizatorului
            onStartVideoCall={() => handleStartVideoCall(selectedChat.id)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selectează o conversație pentru a începe
          </div>
        )}
      </div>

      {/* Video call modal */}
      {showVideoCall && (
        <VideoChat
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          peerName={selectedChat?.name}
        />
      )}
    </div>
  );
}

export default ChatPage;