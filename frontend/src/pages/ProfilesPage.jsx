import React, { useState } from 'react';
import { Heart, X, Video, MapPin, Clock, Star, DollarSign } from 'lucide-react';

const profiles = [
  {
    id: 1,
    name: "Ana",
    age: 25,
    location: "București",
    category: "regular",
    description: "Îmi place să călătoresc și să descopăr locuri noi",
    availability: null,
    rating: 4.8,
    price: null,
    images: ["/profiles/1.jpg"]
  },
  {
    id: 2,
    name: "Maria",
    age: 23,
    location: "Cluj",
    category: "provider",
    description: "Servicii de masaj profesional",
    availability: "Luni-Vineri, 10:00-20:00",
    rating: 4.9,
    price: 150,
    images: ["/profiles/2.jpg"]
  },
  {
    id: 3,
    name: "Elena",
    age: 27,
    location: "Timișoara",
    category: "provider",
    description: "Escort de lux, servicii premium",
    availability: "Program flexibil",
    rating: 5.0,
    price: 300,
    images: ["/profiles/3.jpg"]
  }
];

export function ProfilesPage({ onMatch, onVideoCall }) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const currentProfile = profiles[currentProfileIndex];

  const handleLike = () => {
    onMatch(currentProfile);
    showNextProfile();
  };

  const handleDislike = () => {
    showNextProfile();
  };

  const showNextProfile = () => {
    setCurrentProfileIndex(prev => 
      prev === profiles.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        {/* Card Profil */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative">
            <img 
              src={currentProfile.images[0]} 
              alt={currentProfile.name}
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin size={16} />
                    <span>{currentProfile.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{currentProfile.rating}</span>
                </div>
              </div>
              
              {currentProfile.category === 'provider' && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{currentProfile.availability}</span>
                  </div>
                  {currentProfile.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span>{currentProfile.price} TC/oră</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2">
              <span className={`text-sm px-2 py-1 rounded-full ${
                currentProfile.category === 'provider' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {currentProfile.category === 'provider' ? 'Furnizor Servicii' : 'Regular'}
              </span>
            </div>
            <p className="text-gray-600">{currentProfile.description}</p>
          </div>

          {/* Butoane Acțiuni */}
          <div className="flex justify-around p-4 border-t">
            <button 
              onClick={handleDislike}
              className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Nu sunt interesat"
            >
              <X size={24} />
            </button>

            <button 
              onClick={onVideoCall}
              className="p-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
              title="Video Call"
            >
              <Video size={24} />
            </button>

            <button 
              onClick={handleLike}
              className="p-4 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors"
              title="Îmi place"
            >
              <Heart size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}