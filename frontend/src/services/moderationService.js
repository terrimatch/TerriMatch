// src/services/moderationService.js
export const reportUser = async (reportData) => {
  try {
    const response = await fetch('http://localhost:3001/api/moderation/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reportData,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error reporting user:', error);
    return { success: false, error: error.message };
  }
};

export const blockUser = async (userId, blockedUserId, reason) => {
  try {
    const response = await fetch('http://localhost:3001/api/moderation/block', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        blockedUserId,
        reason,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error: error.message };
  }
};

// Tipuri de raportări
export const REPORT_TYPES = {
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  HARASSMENT: 'harassment',
  SPAM: 'spam',
  FAKE_PROFILE: 'fake_profile',
  UNDERAGE: 'underage',
  OTHER: 'other'
};

// Verificare automată a conținutului
export const validateContent = async (content, type = 'text') => {
  try {
    const response = await fetch('http://localhost:3001/api/moderation/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        type
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error validating content:', error);
    return { success: false, error: error.message };
  }
};