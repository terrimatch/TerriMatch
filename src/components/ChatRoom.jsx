// components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { wsService } from '../services/websocket';

export function ChatRoom({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      wsService.connect();

      wsService.on('chat_message', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message,
          sender: data.userId,
          time: new Date().toLocaleTimeString()
        }]);
      });
    }

    return () => {
      wsService.off('chat_message');
    };
  }, [isOpen]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    wsService.send({
      type: 'chat_message',
      message: newMessage
    });

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString()
    }]);
    setNewMessage('');
  };

  // Rest of the component remains the same...
}