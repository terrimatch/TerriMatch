// src/services/preferenceService.js
export const PREFERENCE_TYPES = {
  AGE_RANGE: 'age_range',
  LOCATION: 'location',
  SERVICE_TYPE: 'service_type',
  PRICE_RANGE: 'price_range',
  AVAILABILITY: 'availability',
  RATING: 'rating',
  LANGUAGE: 'language'
};

export const getUserPreferences = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/preferences/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { success: false, error: error.message };
  }
};

export const updatePreferences = async (userId, preferences) => {
  try {
    const response = await fetch('http://localhost:3001/api/preferences/update', {
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
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message };
  }
};

export const filterProfiles = async (filters) => {
  try {
    const response = await fetch('http://localhost:3001/api/profiles/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters)
    });

    return await response.json();
  } catch (error) {
    console.error('Error filtering profiles:', error);
    return { success: false, error: error.message };
  }
};

// Presetări pentru filtre
export const FILTER_PRESETS = {
  NEARBY: {
    maxDistance: 10, // km
    sortBy: 'distance'
  },
  TOP_RATED: {
    minRating: 4.5,
    sortBy: 'rating'
  },
  MOST_ACTIVE: {
    lastActive: '24h',
    sortBy: 'activity'
  },
  NEW_USERS: {
    joinedWithin: '7d',
    sortBy: 'joined'
  }
};

// Validare preferințe
export const validatePreferences = (preferences) => {
  const errors = [];

  if (preferences.ageRange) {
    const [min, max] = preferences.ageRange;
    if (min < 18 || max > 100 || min > max) {
      errors.push('Interval de vârstă invalid');
    }
  }

  if (preferences.priceRange) {
    const [min, max] = preferences.priceRange;
    if (min < 0 || min > max) {
      errors.push('Interval de preț invalid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};