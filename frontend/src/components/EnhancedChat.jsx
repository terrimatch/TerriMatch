import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Smile, Video, Clock, Star } from 'lucide-react';

export default function EnhancedChat({ chatId, userId, onStartVideoCall }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: userId,
      time: new Date().toLocaleTimeString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Chat */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/profiles/1.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">Ana M.</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Online acum
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                4.9
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onStartVideoCall}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Video size={20} />
        </button>
      </div>

      {/* Zona de mesaje */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === userId ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender === userId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white'
              }`}
            >
              <p>{message.text}</p>
              <span className={`text-xs ${
                message.sender === userId ? 'text-white/70' : 'text-gray-500'
              }`}>
                {message.time}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Image size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Scrie un mesaj..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg ${
              newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}