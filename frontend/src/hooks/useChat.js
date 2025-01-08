// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import useChatStore from '../services/chatState';

export function useChat(chatId, userId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { setTypingStatus } = useChatStore();

  // Încarcă mesaje
  const loadMessages = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true);
      const data = await chatService.getMessages(chatId, offset);
      setMessages(prev => [...prev, ...data.messages]);
      setHasMoreMessages(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Trimite mesaj
  const sendMessage = useCallback(async (content) => {
    try {
      const message = await chatService.sendMessage(chatId, {
        text: content,
        sender: userId,
        time: new Date()
      });
      
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [chatId, userId]);

  // Gestionare status typing
  const handleTyping = useCallback(() => {
    setTypingStatus(chatId, userId, true);
    // Oprește typing status după 3 secunde
    setTimeout(() => {
      setTypingStatus(chatId, userId, false);
    }, 3000);
  }, [chatId, userId, setTypingStatus]);

  // Mark as read
  const markAsRead = useCallback(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      chatService.markAsRead(chatId, userId, lastMessage.id);
    }
  }, [chatId, userId, messages]);

  // Adaugă reacție
  const addReaction = useCallback(async (messageId, reaction) => {
    try {
      await chatService.addReaction(chatId, messageId, userId, reaction);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId
          ? {
              ...msg,
              reactions: [...(msg.reactions || []), { userId, reaction }]
            }
          : msg
      ));
    } catch (err) {
      setError(err.message);
    }
  }, [chatId, userId]);

  // Reply to message
  const replyToMessage = useCallback(async (messageId, content) => {
    try {
      const message = await chatService.sendMessage(chatId, {
        text: content,
        sender: userId,
        replyTo: messageId,
        time: new Date()
      });
      
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [chatId, userId]);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (!isLoading && hasMoreMessages) {
      loadMessages(messages.length);
    }
  }, [isLoading, hasMoreMessages, messages.length, loadMessages]);

  // Effect pentru încărcare inițială
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Effect pentru mark as read
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  return {
    messages,
    isLoading,
    error,
    hasMoreMessages,
    sendMessage,
    handleTyping,
    addReaction,
    replyToMessage,
    loadMoreMessages
  };
}