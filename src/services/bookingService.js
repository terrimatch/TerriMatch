// src/services/bookingService.js
export const SERVICE_TYPES = {
  DATING: 'dating',
  ESCORT: 'escort',
  MASSAGE: 'massage',
  VIDEO_CHAT: 'video_chat',
  PRIVATE_PARTY: 'private_party'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const createBooking = async (bookingData) => {
  try {
    const response = await fetch('http://localhost:3001/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bookingData,
        createdAt: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
};

export const getProviderAvailability = async (providerId, date) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/bookings/availability/${providerId}?date=${date}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider availability:', error);
    return { success: false, error: error.message };
  }
};

export const updateBookingStatus = async (bookingId, status, details = {}) => {
  try {
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        ...details,
        updatedAt: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error.message };
  }
};

export const getProviderServices = async (providerId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/services/provider/${providerId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return { success: false, error: error.message };
  }
};

export const updateProviderServices = async (providerId, services) => {
  try {
    const response = await fetch(`http://localhost:3001/api/services/provider/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        services,
        updatedAt: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating provider services:', error);
    return { success: false, error: error.message };
  }
};

export const getBookingHistory = async (userId, role = 'client') => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/bookings/history/${userId}?role=${role}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return { success: false, error: error.message };
  }
};

// Sistem de plăți pentru servicii
export const processServicePayment = async (bookingId, paymentDetails) => {
  try {
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...paymentDetails,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: error.message };
  }
};

// Validare rezervări
export const validateBooking = (bookingData) => {
  const errors = [];

  if (!bookingData.serviceType || !SERVICE_TYPES[bookingData.serviceType.toUpperCase()]) {
    errors.push('Tip de serviciu invalid');
  }

  if (!bookingData.date || new Date(bookingData.date) < new Date()) {
    errors.push('Data rezervării invalidă');
  }

  if (!bookingData.duration || bookingData.duration < 30) {
    errors.push('Durata minimă este de 30 minute');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Notificări pentru rezervări
export const subscribeToBookingUpdates = (userId, callback) => {
  const ws = new WebSocket('ws://localhost:3001/booking-updates');

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      userId
    }));
  };

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    callback(update);
  };

  return () => ws.close();
};

// Sistem de reminder-uri
export const scheduleReminder = async (bookingId, reminderTime) => {
  try {
    const response = await fetch('http://localhost:3001/api/bookings/reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        reminderTime
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return { success: false, error: error.message };
  }
};