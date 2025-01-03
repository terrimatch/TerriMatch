// src/components/Reviews/index.jsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, Clock, User, MessageCircle } from 'lucide-react';
import { getUserReviews, submitReview, reportReview } from '../../services/reviewService';

export function Reviews({ providerId, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    categories: {
      communication: 0,
      punctuality: 0,
      professionalism: 0
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, positive, negative
  const [sort, setSort] = useState('recent'); // recent, rating
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [providerId]);

  const loadReviews = async () => {
    try {
      const response = await getUserReviews(providerId);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      setError('Eroare la încărcarea review-urilor');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitReview({
        ...newReview,
        providerId,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      });

      if (response.success) {
        setReviews([response.data, ...reviews]);
        setNewReview({
          rating: 0,
          comment: '',
          categories: {
            communication: 0,
            punctuality: 0,
            professionalism: 0
          }
        });
        setShowReviewForm(false);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Eroare la trimiterea review-ului');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    try {
      await reportReview(reviewId);
      // Afișează confirmarea
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const renderStars = (count, onSelect = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={`${
          index < count 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={() => onSelect && onSelect(index + 1)}
      />
    ));
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];

    // Aplicare filtru
    if (filter === 'positive') {
      filtered = filtered.filter(review => review.rating >= 4);
    } else if (filter === 'negative') {
      filtered = filtered.filter(review => review.rating < 4);
    }

    // Aplicare sortare
    if (sort === 'recent') {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header cu statistici */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Review-uri și Rating</h2>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Scrie un Review
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Rating General</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reviews.length}
            </div>
            <div className="text-sm text-gray-500">Total Review-uri</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reviews.filter(r => r.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-500">Review-uri Pozitive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100 || 0)}%
            </div>
            <div className="text-sm text-gray-500">Rată Satisfacție</div>
          </div>
        </div>

        {/* Filtre și Sortare */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate Review-urile</option>
              <option value="positive">Review-uri Pozitive</option>
              <option value="negative">Review-uri Negative</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Cele mai recente</option>
              <option value="rating">După rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formular Review Nou */}
      {showReviewForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Scrie un Review</h3>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating General</label>
              <div className="flex gap-1">
                {renderStars(newReview.rating, (rating) => 
                  setNewReview({...newReview, rating})
                )}
              </div>
            </div>

            {/* Categorii Rating */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(newReview.categories).map(([category, rating]) => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-2">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                  <div className="flex gap-1">
                    {renderStars(rating, (value) => 
                      setNewReview({
                        ...newReview, 
                        categories: {
                          ...newReview.categories,
                          [category]: value
                        }
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comentariu</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
                minLength="10"
                placeholder="Descrie experiența ta..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSubmitting ? 'Se trimite...' : 'Trimite Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Review-uri */}
      <div className="space-y-4">
        {getFilteredAndSortedReviews().map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{review.userName}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {renderStars(review.rating)}
              </div>
            </div>

            {/* Categorii Rating */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Object.entries(review.categories).map(([category, rating]) => (
                <div key={category} className="text-sm">
                  <div className="text-gray-500">{category}</div>
                  <div className="flex gap-1">
                    {renderStars(rating)}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                  <ThumbsUp size={18} />
                  <span>{review.likes || 0}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                  <MessageCircle size={18} />
                  <span>{review.replies?.length || 0}</span>
                </button>
              </div>
              <button
                onClick={() => handleReportReview(review.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <Flag size={18} />
              </button>
            </div>

            {/* Răspunsuri */}
            {review.replies?.length > 0 && (
              <div className="mt-4 pl-12 space-y-4">
                {review.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-semibold">{reply.userName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(reply.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{reply.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;