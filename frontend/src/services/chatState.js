import { create } from 'zustand';

const useChatStore = create((set) => ({
  activeChats: [],
  currentChat: null,
  unreadMessages: {},
  typingStatus: {},
  
  setActiveChats: (chats) => set({ activeChats: chats }),
  
  setCurrentChat: (chatId) => {
    set({ currentChat: chatId });
    if (chatId) {
      set(state => ({
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: 0
        }
      }));
    }
  },

  addUnreadMessage: (chatId) => set(state => ({
    unreadMessages: {
      ...state.unreadMessages,
      [chatId]: (state.unreadMessages[chatId] || 0) + 1
    }
  })),

  setTypingStatus: (chatId, userId, isTyping) => set(state => ({
    typingStatus: {
      ...state.typingStatus,
      [chatId]: isTyping 
        ? [...(state.typingStatus[chatId] || []), userId]
        : (state.typingStatus[chatId] || []).filter(id => id !== userId)
    }
  })),

  initializeNotifications: () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}));

export default useChatStore;