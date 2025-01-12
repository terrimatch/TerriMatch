import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Efecte de fundal animate */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      {/* Conținut principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo și titlu */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TerriMatch</h1>
          <p className="text-lg text-gray-300">Găsește sufletul pereche</p>
        </div>

        {/* Butoane de login */}
        <div className="w-full max-w-md space-y-4">
          <Button 
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full shadow-lg transform transition hover:scale-105"
            onClick={() => {/* Handle Telegram login */}}
          >
            Continuă cu Telegram
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Secțiune de statistici */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-2xl font-bold text-white">1M+</p>
              <p className="text-sm text-gray-300">Utilizatori</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-2xl font-bold text-white">500K+</p>
              <p className="text-sm text-gray-300">Matches</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-2xl font-bold text-white">100K+</p>
              <p className="text-sm text-gray-300">Activi zilnic</p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur text-center">
              <p className="text-white font-medium">Video Chat</p>
              <p className="text-sm text-gray-300">1 TerriCoin/min</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur text-center">
              <p className="text-white font-medium">Mesaje</p>
              <p className="text-sm text-gray-300">20 gratuite</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Prin continuare, accepți</p>
          <p>
            <a href="#" className="text-pink-400 hover:text-pink-300">Termenii și condițiile</a>
            {' și '}
            <a href="#" className="text-pink-400 hover:text-pink-300">Politica de confidențialitate</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
