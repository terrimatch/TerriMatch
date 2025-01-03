// src/services/verificationService.js
export const DOCUMENT_TYPES = {
  ID_CARD: 'id_card',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'driving_license',
  SELFIE: 'selfie'
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const uploadDocument = async (userId, documentType, file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', userId);
    formData.append('type', documentType);

    const response = await fetch('http://localhost:3001/api/verification/upload', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

export const getVerificationStatus = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/verification/status/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return { success: false, error: error.message };
  }
};

export const requestVerification = async (userId) => {
  try {
    const response = await fetch('http://localhost:3001/api/verification/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error requesting verification:', error);
    return { success: false, error: error.message };
  }
};

// Verificare automată a documentelor
export const validateDocument = async (documentId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/verification/validate/${documentId}`);
    return await response.json();
  } catch (error) {
    console.error('Error validating document:', error);
    return { success: false, error: error.message };
  }
};

// Sistem de notificări pentru verificări
export const subscribeToVerificationUpdates = (userId, callback) => {
  const ws = new WebSocket('ws://localhost:3001/verification-updates');

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