export const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    return tg;
  }
  return null;
};

export const connectTelegramUser = async (userId, username) => {
  try {
    const response = await fetch('http://localhost:3001/api/telegram/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username })
    });
    return await response.json();
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    return { success: false, error: error.message };
  }
};

export const isTelegramWebApp = () => {
  return !!window.Telegram?.WebApp;
};

export const sendDataToBot = (data) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
};