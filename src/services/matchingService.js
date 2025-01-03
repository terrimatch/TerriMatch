// src/services/matchingService.js
export const getMatches = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/matches/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    return { success: false, error: error.message };
  }
};

export const likeProfile = async (userId, likedUserId) => {
  try {
    const response = await fetch('http://localhost:3001/api/matches/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        likedUserId
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error liking profile:', error);
    return { success: false, error: error.message };
  }
};

export const getRecommendations = async (userId, preferences) => {
  try {
    const response = await fetch('http://localhost:3001/api/matches/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        preferences
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { success: false, error: error.message };
  }
};