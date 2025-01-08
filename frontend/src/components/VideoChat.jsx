import React, { useState } from 'react';
import { X, Video, Mic, MicOff, VideoOff, Phone } from 'lucide-react';

export function VideoChat({ isOpen, onClose }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50">
      <div className="h-full flex flex-col">
        {/* Timer și informații */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white">
          {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>

        {/* Video Area */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="text-gray-400" size={64} />
              </div>
            )}
            
            {/* Preview mic/profilul propriu */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg">
              {/* Aici va fi preview-ul video propriu */}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 flex justify-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? <MicOff color="white" /> : <Mic color="white" />}
          </button>

          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-colors ${
              !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isVideoOn ? <Video color="white" /> : <VideoOff color="white" />}
          </button>

          <button 
            onClick={onClose}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <Phone color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}