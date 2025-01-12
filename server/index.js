const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('Starting server...');
console.log('Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);

// Verifică token-ul
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('Bot token missing!');
    process.exit(1);
}

// Inițializare bot fără webhook, doar cu polling
let bot;
try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: true // Folosim polling în loc de webhook
    });
    console.log('Bot initialized successfully');
} catch (error) {
    console.error('Error initializing bot:', error);
    process.exit(1);
}

// Gestionare comenzi
bot.on('message', async (msg) => {
    console.log('Received message:', msg.text);
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        try {
            const welcomeMessage = `
👋 Bine ai venit la TerriMatch!

💝 Găsește-ți sufletul pereche perfect pentru tine.
💌 20 mesaje gratuite pentru început
🎥 Video chat disponibil pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:`;

            await bot.sendMessage(chatId, welcomeMessage, {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "🚀 Deschide TerriMatch",
                            web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                        }
                    ]]
                }
            });
            console.log('Welcome message sent to:', chatId);
        } catch (error) {
            console.error('Error sending welcome message:', error);
            await bot.sendMessage(chatId, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        }
    }
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
});

// Route pentru verificare status
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is running',
        botActive: !!bot
    });
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Gestionare închidere grațioasă
process.on('SIGTERM', () => {
    bot.stopPolling();
    process.exit(0);
});

module.exports = app;
