const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        botInitialized: true,
        polling: bot.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Serve web app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Bot command handler
bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, 
            '🌟 Bine ai venit la TerriMatch!\n\n' +
            '💝 20 mesaje gratuite\n' +
            '🎥 Video chat pentru 1 TerriCoin/minut\n\n' +
            'Apasă butonul pentru a începe:', {
            reply_markup: {
                inline_keyboard: [[{
                    text: "❤️ Deschide TerriMatch",
                    web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                }]]
            }
        });
        console.log('Welcome message sent to:', msg.chat.id);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Error logging
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

module.exports = app;
