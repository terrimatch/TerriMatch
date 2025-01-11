import React, { useEffect, useState } from 'react';
import RegistrationForm from './components/RegistrationForm';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Inițializare Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
      tg.ready();
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <RegistrationForm />
    </div>
  );
}

export default App;
