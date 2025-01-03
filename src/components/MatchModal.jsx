import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

export function MatchModal({ isOpen, match, onClose, onStartChat }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">It's a Match!</h2>
          <p className="text-gray-600">You and {match.name} liked each other</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onStartChat}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Start Chatting
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
}