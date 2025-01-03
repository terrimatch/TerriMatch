// src/components/Chat/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Smile, Video, Phone, MoreVertical, Search, Star, Clock } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export function Chat({ currentUserId, onStartVideoCall }) {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    initializeWebSocket();
    loadConversations();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [currentUserId]);

  const initializeWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      console.log('Connected to chat server');
      ws.current.send(JSON.stringify({
        type: 'auth',
        userId: currentUserId
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from chat server');
      // Reconectare automată
      setTimeout(initializeWebSocket, 3000);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'message':
        handleNewMessage(data);
        break;
      case 'typing':
        handleTypingStatus(data);
        break;
      // Adaugă alte cazuri după necesitate
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci conversațiile de la server
      // Pentru exemplu, folosim date statice
      setConversations([
        {
          id: '1',
          user: {
            id: '2',
            name: 'Ana M.',
            image: '/profiles/1.jpg',
            online: true,
            rating: 4.9
          },
          lastMessage: {
            text: 'Bună! Aș dori să rezerv o sesiune.',
            timestamp: new Date().toISOString(),
            unread: true
          }
        },
        // Adaugă mai multe conversații
      ]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      senderId: currentUserId,
      timestamp: new Date().toISOString()
    };

    // Trimite mesajul prin WebSocket
    ws.current.send(JSON.stringify({
      type: 'message',
      recipientId: selectedChat.user.id,
      content: message
    }));

    // Actualizează UI-ul local
    setSelectedChat(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage]
    }));

    setMessage('');
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  };

  const handleSelectEmoji = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Lista de conversații */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută conversații..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conv.user.image}
                      alt={conv.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.user.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate">{conv.user.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-gray-600">{conv.user.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Principal */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Header Chat */}
          <div className="p-4 bg-white border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={selectedChat.user.image}
                alt={selectedChat.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{selectedChat.user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {selectedChat.user.online ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Ultima dată văzut recent</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartVideoCall(selectedChat.user.id)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Video size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Mesaje */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={chatRef}>
            {selectedChat.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.senderId === currentUserId 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-xs ${
                    msg.senderId === currentUserId ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Smile size={20} />
              </button>
              
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full left-0 mb-2">
                  <EmojiPicker onEmojiClick={handleSelectEmoji} />
                </div>
              )}

              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Image size={20} />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Scrie un mesaj..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-lg ${
                  message.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500">Selectează o conversație pentru a începe</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;