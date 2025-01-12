import React, { useEffect } from 'react';
import { Heart, MessageCircle, Video } from 'lucide-react';

const Login = () => {
    useEffect(() => {
        // Inițializare Telegram WebApp
        const tg = window.Telegram.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-4">
            <div className="max-w-md mx-auto">
                {/* Header/Logo */}
                <div className="text-center mb-8 pt-8">
                    <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-lg mb-4">
                        <Heart className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">TerriMatch</h1>
                    <p className="text-white/80">Găsește sufletul pereche</p>
                </div>

                {/* Features Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-lg text-center">
                        <MessageCircle className="w-8 h-8 text-white mx-auto mb-2" />
                        <h3 className="text-white font-semibold mb-1">Chat</h3>
                        <p className="text-white/70 text-sm">20 mesaje gratuite</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-lg text-center">
                        <Video className="w-8 h-8 text-white mx-auto mb-2" />
                        <h3 className="text-white font-semibold mb-1">Video Chat</h3>
                        <p className="text-white/70 text-sm">1 TerriCoin/min</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-lg">
                        <p className="text-2xl font-bold text-white">500K+</p>
                        <p className="text-white/70 text-sm">Utilizatori</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-lg">
                        <p className="text-2xl font-bold text-white">200K+</p>
                        <p className="text-white/70 text-sm">Match-uri</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-lg">
                        <p className="text-2xl font-bold text-white">50K+</p>
                        <p className="text-white/70 text-sm">Online</p>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={() => {
                        const tg = window.Telegram.WebApp;
                        if (tg) {
                            // Aici putem trimite datele către backend
                            tg.MainButton.text = "Începe";
                            tg.MainButton.show();
                        }
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-full font-semibold text-lg shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 mb-6"
                >
                    Începe Aventura
                </button>

                {/* Footer */}
                <div className="text-center text-white/60 text-sm">
                    <p>Prin continuare, accepți</p>
                    <p>
                        <a href="#" className="text-white hover:underline">Termenii și Condițiile</a>
                        {' și '}
                        <a href="#" className="text-white hover:underline">Politica de Confidențialitate</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
