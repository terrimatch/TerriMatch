const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Server setup
const app = express();
app.use(cors());
app.use(express.json());

// Bot initialization
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Bot command handler
bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, 
            '🌟 Bine ai venit la TerriMatch!\n\n' +
            '💝 20 mesaje gratuite\n' +
            '🎥 Video chat pentru 1 TerriCoin/minut\n\n' +
            'Apasă butonul de mai jos pentru a începe:', {
            reply_markup: {
                inline_keyboard: [[{
                    text: "❤️ Deschide TerriMatch",
                    web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                }]]
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

// Server routes
app.get('/', (_, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(process.env.PORT || 3000);

module.exports = app;
