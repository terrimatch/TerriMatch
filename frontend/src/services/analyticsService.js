// src/services/analyticsService.js
export const trackEvent = async (eventData) => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error tracking event:', error);
    return { success: false, error: error.message };
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/analytics/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: error.message };
  }
};

export const EVENT_TYPES = {
  PROFILE_VIEW: 'profile_view',
  MESSAGE_SENT: 'message_sent',
  VIDEO_CALL: 'video_call',
  SERVICE_COMPLETED: 'service_completed',
  PAYMENT_MADE: 'payment_made',
  REGISTRATION: 'registration'
};

// Tracking pentru performanța utilizatorilor
export const getUserPerformance = async (userId, period = '30d') => {
  try {
    const response = await fetch(`http://localhost:3001/api/analytics/performance/${userId}?period=${period}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user performance:', error);
    return { success: false, error: error.message };
  }
};