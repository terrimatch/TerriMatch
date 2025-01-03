// src/services/reviewService.js
export const submitReview = async (reviewData) => {
  try {
    const response = await fetch('http://localhost:3001/api/reviews/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reviewData,
        timestamp: Date.now()
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: error.message };
  }
};

export const getUserReviews = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/reviews/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return { success: false, error: error.message };
  }
};

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1);
};

export const REVIEW_CATEGORIES = {
  COMMUNICATION: 'communication',
  PUNCTUALITY: 'punctuality',
  PROFESSIONALISM: 'professionalism',
  OVERALL: 'overall'
};

export const validateReview = (reviewData) => {
  const errors = [];

  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Rating invalid');
  }

  if (!reviewData.comment || reviewData.comment.length < 10) {
    errors.push('Comentariul trebuie să aibă minim 10 caractere');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};