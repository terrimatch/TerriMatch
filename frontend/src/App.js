import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #ff6b6b, #4ecdc4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{textAlign: 'center'}}>
        <h1>TerriMatch</h1>
        <p>Bine ai venit! Pregătește-te să întâlnești persoane noi.</p>
      </div>
    </div>
  );
}

export default App;
