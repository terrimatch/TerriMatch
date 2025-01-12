import React from 'react';
import { Heart, MessageCircle, Video } from 'lucide-react';

const TelegramWebApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      {/* Header */}
      <header className="p-4 bg-white/10 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            <span className="text-xl font-bold text-white">TerriMatch</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white">200 TerriCoin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 p-4">
        {/* Welcome Message */}
        <div className="text-center text-white mb-8 mt-4">
          <h1 className="text-2xl font-bold mb-2">Bine ai venit pe TerriMatch!</h1>
          <p>Completează profilul tău pentru a începe</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 space-y-6 max-w-md mx-auto">
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center mb-2">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <button className="text-white bg-pink-500 px-4 py-2 rounded-full">
                Adaugă Poză
              </button>
            </div>

            {/* Profile Fields */}
            <div>
              <label className="text-white block mb-2">Numele tău</label>
              <input 
                type="text"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="Introdu numele tău"
              />
            </div>

            <div>
              <label className="text-white block mb-2">Despre tine</label>
              <textarea 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="Spune-ne despre tine..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
            <MessageCircle className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium">Chat</p>
            <p className="text-sm text-white/80">20 mesaje gratuite</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
            <Video className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium">Video Chat</p>
            <p className="text-sm text-white/80">1 TerriCoin/minut</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/10 backdrop-blur-md p-4">
        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full font-medium">
          Începe Aventura
        </button>
      </nav>
    </div>
  );
};

export default TelegramWebApp;
