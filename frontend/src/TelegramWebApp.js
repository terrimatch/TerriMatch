import React, { useState, useEffect } from 'react';
import { Heart, Camera, MapPin, Mail, Calendar } from 'lucide-react';

const TelegramWebApp = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    photos: [],
    name: '',
    age: '',
    location: '',
    bio: '',
    interests: []
  });

  useEffect(() => {
    // Inițializare Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Adaugă poze 📸</h2>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div 
            key={index}
            className="aspect-square rounded-lg bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30"
          >
            <Camera className="w-8 h-8 text-white/60" />
          </div>
        ))}
      </div>
      <button
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full"
      >
        Continuă
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Despre tine</h2>
      <div className="space-y-4">
        <div>
          <label className="text-white/80 block mb-2">Nume</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            placeholder="Numele tău"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="text-white/80 block mb-2">Vârstă</label>
          <input
            type="number"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            placeholder="Vârsta ta"
            value={profile.age}
            onChange={(e) => setProfile({...profile, age: e.target.value})}
          />
        </div>

        <div>
          <label className="text-white/80 block mb-2">Locație</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            placeholder="Orașul tău"
            value={profile.location}
            onChange={(e) => setProfile({...profile, location: e.target.value})}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="w-1/2 border border-white/20 text-white py-3 rounded-full"
        >
          Înapoi
        </button>
        <button
          onClick={() => setStep(3)}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full"
        >
          Continuă
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Interese & Bio</h2>
      <div className="space-y-4">
        <div>
          <label className="text-white/80 block mb-2">Despre mine</label>
          <textarea
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            placeholder="Spune-ne despre tine..."
            rows="4"
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
          />
        </div>

        <div>
          <label className="text-white/80 block mb-2">Interese</label>
          <div className="flex flex-wrap gap-2">
            {['Sport', 'Muzică', 'Film', 'Călătorii', 'Artă', 'Gaming'].map((interest) => (
              <button
                key={interest}
                className={`px-4 py-2 rounded-full ${
                  profile.interests.includes(interest)
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-white/80'
                }`}
                onClick={() => {
                  const newInterests = profile.interests.includes(interest)
                    ? profile.interests.filter(i => i !== interest)
                    : [...profile.interests, interest];
                  setProfile({...profile, interests: newInterests});
                }}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="w-1/2 border border-white/20 text-white py-3 rounded-full"
        >
          Înapoi
        </button>
        <button
          onClick={() => {
            // Aici se va trimite profilul către server
            console.log('Profile complete:', profile);
          }}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full"
        >
          Finalizează
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-pink-500" />
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`w-3 h-3 rounded-full mx-1 ${
                step >= number ? 'bg-pink-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default TelegramWebApp;
