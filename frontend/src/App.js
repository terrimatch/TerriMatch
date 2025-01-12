import React, { useEffect, useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import MainFeed from './components/MainFeed';
import useAuth from './hooks/useAuth';

function App() {
    const { user, loading } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Inițializare Telegram WebApp
        const tg = window.Telegram.WebApp;
        if (tg) {
            tg.ready();
            setIsInitialized(true);
        }
    }, []);

    if (loading || !isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Se încarcă...</p>
                </div>
            </div>
        );
    }

    // Dacă utilizatorul nu este înregistrat, arată formularul de înregistrare
    if (!user?.registration_completed) {
        return <RegistrationForm />;
    }

    // Dacă utilizatorul este înregistrat, arată feed-ul principal
    return <MainFeed />;
}

export default App;
