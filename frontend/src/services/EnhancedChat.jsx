// src/components/EnhancedChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Smile, Link, MoreVertical, Check, CheckCheck } from 'lucide-react';
import chatService from '../services/chatService';
import EmojiPicker from 'emoji-picker-react';

export function EnhancedChat({ chatId, userId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const lastMessageRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Ascultă pentru mesaje noi și updates
  useEffect(() => {
    const unsubscribe = chatService.onMessage(chatId, handleMessage);
    return () => unsubscribe();
  }, [chatId]);

  // Auto-scroll la mesaje noi
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handler pentru mesaje și updates
  const handleMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message]);
        break;
      case 'typing_status':
        setIsTyping(data.users.length > 0);
        break;
      case 'message_update':
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId ? data.message : msg
          )
        );
        break;
      default:
        break;
    }
  };

  // Gestionare typing status
  const handleTyping = () => {
    chatService.startTyping(chatId, userId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.stopTyping(chatId, userId);
    }, 3000);
  };

  // Trimitere mesaj
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Procesează conținutul pentru link-uri
    const processedContent = await chatService.processMessageContent(newMessage);

    const message = {
      text: newMessage,
      sender: userId,
      type: 'text',
      replyTo: replyingTo,
      ...processedContent
    };

    chatService.sendMessage(chatId, message);
    setNewMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  // Upload imagine
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      const message = {
        text: '',
        sender: userId,
        type: 'image',
        media: data.url
      };

      chatService.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Adaugă emoji
  const onEmojiClick = (event, emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // Adaugă reacție
  const handleReaction = (messageId, reaction) => {
    chatService.addReaction(chatId, messageId, userId, reaction);
    setSelectedMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={`/api/user/${chatId}/avatar`}
            alt="Chat Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">Chat Name</h3>
            {isTyping && (
              <p className="text-sm text-gray-500">typing...</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`flex ${message.sender === userId ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 relative group ${
                message.sender === userId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              {/* Reply reference */}
              {message.replyTo && (
                <div className={`text-sm mb-1 ${
                  message.sender === userId ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Replying to message...
                </div>
              )}

              {/* Message content */}
              {message.type === 'text' && <p>{message.text}</p>}
              {message.type === 'image' && (
                <img 
                  src={message.media} 
                  alt="Shared image" 
                  className="rounded max-w-full"
                />
              )}

              {/* Link previews */}
              {message.previews?.map(preview => (
                <div key={preview.url} className="mt-2 border rounded overflow-hidden">
                  {preview.image && (
                    <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-2">
                    <h4 className="font-semibold">{preview.title}</h4>
                    <p className="text-sm opacity-75">{preview.description}</p>
                  </div>
                </div>
              ))}

              {/* Message meta */}
              <div className={`text-xs mt-1 flex items-center gap-1 ${
                message.sender === userId ? 'text-white/70' : 'text-gray-500'
              }`}>
                {message.time.toLocaleTimeString()}
                {message.sender === userId && (
                  message.status === 'read' 
                    ? <CheckCheck size={14} />
                    : <Check size={14} />
                )}
              </div>

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="absolute -bottom-6 right-0 flex gap-1">
                  {message.reactions.map((reaction, i) => (
                    <span key={i} className="bg-white rounded-full px-2 py-1 shadow text-sm">
                      {reaction.reaction}
                    </span>
                  ))}
                </div>
              )}

              {/* Message actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelectedMessage(message.id)}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-blue-600 rounded" />
            <div>
              <p className="text-sm text-gray-500">Replying to message</p>
              <p className="text-sm truncate">{messages.find(m => m.id === replyingTo)?.text}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Smile size={20} />
          </button>
          
          <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Image size={20} />
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            onInput={handleTyping}
            placeholder="Scrie un mesaj..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
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

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            disableAutoFocus
            native
          />
        </div>
      )}

      {/* Message actions menu */}
      {selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-4 min-w-[200px]">
            <button
              onClick={() => {
                setReplyingTo(selectedMessage);
                setSelectedMessage(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Reply
            </button>
            <div className="border-t my-2" />
            <div className="p-2">
              <p className="text-sm text-gray-500 mb-2">React with:</p>
              <div className="flex gap-2">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(selectedMessage, emoji)}
                    className="hover:bg-gray-100 p-2 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t my-2" />
            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedChat;