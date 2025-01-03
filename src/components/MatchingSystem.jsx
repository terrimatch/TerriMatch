import React, { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Video } from 'lucide-react';

export function MatchingSystem({ onMatch, onPass, onChat, onVideo }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const handleSwipe = (direction, action) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      action();
      setSwipeDirection(null);
      // Simulare încărcare profil nou
      setLoading(true);
      setTimeout(() => {
        fetchNextProfile();
      }, 500);
    }, 300);
  };

  const fetchNextProfile = () => {
    // Aici ar trebui să fie o cerere reală către backend
    // Pentru demo, simulăm un profil
    setTimeout(() => {
      setCurrentProfile({
        id: Math.random(),
        name: 'Ana Maria',
        age: 25,
        location: 'București',
        photo: '/profiles/1.jpg',
        interests: ['Muzică', 'Călătorii', 'Artă'],
        compatibility: Math.floor(Math.random() * 30) + 70
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchNextProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative max-w-lg mx-auto">
      <div
        className={`transition-transform duration-300 ${
          swipeDirection === 'left' ? '-translate-x-full rotate-[-20deg]' :
          swipeDirection === 'right' ? 'translate-x-full rotate-[20deg]' :
          ''
        }`}
      >
        {currentProfile && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            <div 
              className="h-96 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentProfile.photo})` }}
            />
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {currentProfile.name}, {currentProfile.age}
                  </h3>
                  <p className="text-white/80">{currentProfile.location}</p>
                </div>
                <div className="bg-blue-600 px-3 py-1 rounded-full">
                  <span className="text-sm text-white">
                    {currentProfile.compatibility}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map(interest => (
                    <span
                      key={interest}
                      className="bg-white/10 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => handleSwipe('left', onPass)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <X size={24} />
                    Pass
                  </button>
                  
                  <button
                    onClick={() => handleSwipe('right', onMatch)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Heart size={24} />
                    Like
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onChat}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={24} />
                    Chat
                  </button>
                  
                  <button
                    onClick={onVideo}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Video size={24} />
                    Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}