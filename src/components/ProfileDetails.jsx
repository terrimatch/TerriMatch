import React from 'react';
import { RatingSystem } from './RatingSystem';
import { MapPin, Briefcase, Book, Music, Camera } from 'lucide-react';

export function ProfileDetails({ profile, onRate }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {profile.name}, {profile.age}
          </h3>
          <p className="text-white/80 flex items-center gap-2">
            <MapPin size={16} />
            {profile.location}
          </p>
        </div>
        <RatingSystem rating={profile.rating} onRate={onRate} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white/80">
          <Briefcase size={20} />
          <span>{profile.occupation}</span>
        </div>
        
        <div className="flex items-center gap-3 text-white/80">
          <Book size={20} />
          <span>{profile.education}</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-semibold">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-blue-600/50 text-white px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-semibold">Photos</h4>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}