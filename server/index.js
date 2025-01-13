const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();
app.use(cors());
app.use(express.json());

// Verificare token
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing!');
    process.exit(1);
}

// Inițializare bot cu polling
let bot;
try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: true
    });
    console.log('Bot initialized successfully');
} catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
}

// Handler pentru mesaje - pentru debugging
bot.on('message', (msg) => {
    console.log('Received message:', msg.text, 'from:', msg.chat.id);
});

// Handler specific pentru /start
bot.onText(/\/start/, async (msg) => {
    console.log('Received /start command from:', msg.chat.id);
    
    try {
        const welcomeMessage = `
🌟 Bine ai venit la TerriMatch!

Aici vei găsi:
💝 Persoane compatibile cu tine
💌 20 mesaje gratuite
🎥 Video chat pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:`;

        await bot.sendMessage(msg.chat.id, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "❤️ Deschide TerriMatch",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                    }
                ]]
            }
        });
        console.log('Welcome message sent successfully');
    } catch (error) {
        console.error('Error sending welcome message:', error);
        try {
            await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        } catch (retryError) {
            console.error('Error sending error message:', retryError);
        }
    }
});

// Rută pentru verificarea stării
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        botActive: bot?.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Gestionare erori bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Bot polling:', bot?.isPolling());
});

// Gestionare închidere grațioasă
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    bot.stopPolling();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
