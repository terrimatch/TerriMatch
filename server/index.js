const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();
app.use(cors());
app.use(express.json());

// Logging pentru debugging
console.log('Starting server...');
console.log('Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);

// Configurare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Handler pentru /start
bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, `
🌟 Bine ai venit la TerriMatch!

Aici vei găsi:
💝 Persoane compatibile cu tine
💌 20 mesaje gratuite
🎥 Video chat pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{
                    text: "❤️ Deschide TerriMatch",
                    web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                }]]
            }
        });
        console.log('Welcome message sent to:', msg.chat.id);
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

// Rută de bază
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        message: 'TerriMatch Bot is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
