// src/services/chatService.js
let ws = null;

export const initializeWebSocket = (userId, onMessageReceived) => {
  ws = new WebSocket('ws://localhost:3001');

  ws.onopen = () => {
    console.log('Connected to chat server');
    // Trimite ID-ul utilizatorului pentru autentificare
    ws.send(JSON.stringify({
      type: 'auth',
      userId: userId
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessageReceived(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('Disconnected from chat server');
    // Reconectare automată
    setTimeout(() => initializeWebSocket(userId, onMessageReceived), 3000);
  };

  return ws;
};

export const sendMessage = (recipientId, message) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket connection not established');
  }

  ws.send(JSON.stringify({
    type: 'message',
    recipientId,
    content: message,
    timestamp: Date.now()
  }));
};

export const startTyping = (recipientId) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: 'typing',
    recipientId,
    isTyping: true
  }));
};

export const stopTyping = (recipientId) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: 'typing',
    recipientId,
    isTyping: false
  }));
};

export const getChatHistory = async (chatId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/chat/history/${chatId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return { success: false, error: error.message };
  }
};