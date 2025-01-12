const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Logging pentru debugging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Bot token length:', process.env.TELEGRAM_BOT_TOKEN?.length || 'not set');
console.log('Webapp URL:', process.env.TELEGRAM_WEBAPP_URL);

// Middleware
app.use(cors());
app.use(express.json());

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Logging pentru erori bot
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

bot.on('error', (error) => {
    console.error('Bot general error:', error);
});

// Handler pentru comanda /start
bot.onText(/\/start/, async (msg) => {
    console.log('Received /start command from:', msg.chat.id);
    try {
        const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉

Găsește sufletul pereche perfect pentru tine.
Apasă butonul de mai jos pentru a începe:
        `;
        
        await bot.sendMessage(msg.chat.id, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "💝 Deschide TerriMatch",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                    }
                ]]
            }
        });
        console.log('Welcome message sent successfully');
    } catch (error) {
        console.error('Error in /start command:', error);
        try {
            await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        } catch (sendError) {
            console.error('Error sending error message:', sendError);
        }
    }
});

// Handler pentru orice mesaj
bot.on('message', (msg) => {
    console.log('Received message:', msg);
});

// Rută pentru verificare server
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        botInitialized: !!bot,
        timestamp: new Date().toISOString()
    });
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...');
    bot.stopPolling();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
