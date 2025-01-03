// src/services/notificationService.js
let ws = null;

export const initializeNotifications = (userId, onNotificationReceived) => {
  ws = new WebSocket('ws://localhost:3001/notifications');

  ws.onopen = () => {
    console.log('Connected to notification server');
    ws.send(JSON.stringify({
      type: 'auth',
      userId: userId
    }));
  };

  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    onNotificationReceived(notification);
  };

  ws.onerror = (error) => {
    console.error('Notification WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('Disconnected from notification server');
    // Reconectare automată
    setTimeout(() => initializeNotifications(userId, onNotificationReceived), 3000);
  };

  return ws;
};

export const getNotificationSettings = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/notifications/settings/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return { success: false, error: error.message };
  }
};

export const updateNotificationSettings = async (userId, settings) => {
  try {
    const response = await fetch('http://localhost:3001/api/notifications/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return { success: false, error: error.message };
  }
};

export const getNotificationHistory = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/notifications/history/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return { success: false, error: error.message };
  }
};