import React from 'react';
import { Star } from 'lucide-react';

export function RatingSystem({ rating, onRate, size = "normal" }) {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={`focus:outline-none transition-colors ${
            size === "small" ? "p-1" : "p-2"
          }`}
        >
          <Star
            size={size === "small" ? 16 : 24}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}