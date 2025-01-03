import React from 'react';
import { Heart, X, MessageCircle, Video } from 'lucide-react';

export function ProfileCard({ profile, onLike, onPass, onChat, onVideo }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
      <div 
        className="h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${profile.photo})` }}
      />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{profile.name}, {profile.age}</h3>
            <p className="text-white/80">{profile.location}</p>
          </div>
          <div className="bg-blue-600 px-3 py-1 rounded-full">
            <span className="text-sm text-white">{profile.compatibility}% Match</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onChat}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Chat
          </button>

          <button
            onClick={onVideo}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Video size={20} />
            Video
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onPass}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
          >
            <X size={20} />
            Pass
          </button>

          <button
            onClick={onLike}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Heart size={20} />
            Like
          </button>
        </div>
      </div>
    </div>
  );
}