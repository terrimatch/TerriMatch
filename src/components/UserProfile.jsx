import React, { useState } from 'react';
import { Camera, MapPin, Heart, Star, Book, Music, Film } from 'lucide-react';

const interests = [
  { icon: <Music size={16} />, label: 'Muzică' },
  { icon: <Film size={16} />, label: 'Film' },
  { icon: <Book size={16} />, label: 'Cărți' },
  { icon: <Camera size={16} />, label: 'Fotografie' },
  // Adăugați mai multe interese aici
];

export function UserProfile({ profile, onEdit, isEditing = false }) {
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onEdit(editedProfile);
  };

  if (isEditing) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-6">
        <div className="space-y-4">
          {/* Imagine profil */}
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={editedProfile.photo || '/placeholder-avatar.jpg'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white">
              <Camera size={20} />
            </button>
          </div>

          {/* Informații de bază */}
          <div className="space-y-4">
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
              placeholder="Nume"
            />
            
            <div className="flex gap-4">
              <input
                type="number"
                value={editedProfile.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-1/3 px-4 py-2 bg-white/10 rounded-lg text-white"
                placeholder="Vârstă"
              />
              
              <input
                type="text"
                value={editedProfile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white"
                placeholder="Locație"
              />
            </div>
          </div>

          {/* Interese */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Interese</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <button
                  key={interest.label}
                  onClick={() => {
                    const currentInterests = editedProfile.interests || [];
                    const hasInterest = currentInterests.includes(interest.label);
                    handleChange('interests', 
                      hasInterest 
                        ? currentInterests.filter(i => i !== interest.label)
                        : [...currentInterests, interest.label]
                    );
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                    (editedProfile.interests || []).includes(interest.label)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {interest.icon}
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Despre mine</h3>
            <textarea
              value={editedProfile.about}
              onChange={(e) => handleChange('about', e.target.value)}
              className="w-full h-32 px-4 py-2 bg-white/10 rounded-lg text-white"
              placeholder="Spune câteva cuvinte despre tine..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Salvează Profilul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-6">
      {/* Imagine și informații de bază */}
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4">
          <img
            src={profile.photo || '/placeholder-avatar.jpg'}
            alt={profile.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-white">{profile.name}, {profile.age}</h2>
        <p className="text-white/80 flex items-center justify-center gap-2 mt-1">
          <MapPin size={16} />
          {profile.location}
        </p>
      </div>

      {/* Statistici */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{profile.matches}</div>
          <div className="text-sm text-white/70">Matches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{profile.rating}</div>
          <div className="text-sm text-white/70">Rating</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{profile.terricoins}</div>
          <div className="text-sm text-white/70">TerriCoins</div>
        </div>
      </div>

      {/* Interese */}
      <div>
        <h3 className="text-white font-semibold mb-2">Interese</h3>
        <div className="flex flex-wrap gap-2">
          {(profile.interests || []).map(interest => (
            <span
              key={interest}
              className="bg-white/10 text-white px-3 py-1 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Despre */}
      {profile.about && (
        <div>
          <h3 className="text-white font-semibold mb-2">Despre mine</h3>
          <p className="text-white/80">{profile.about}</p>
        </div>
      )}
    </div>
  );
}