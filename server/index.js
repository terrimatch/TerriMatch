const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servește fișierele statice din frontend/build
app.use(express.static('frontend/build'));

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Handler pentru comanda /start
bot.onText(/\/start/, async (msg) => {
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
    } catch (error) {
        console.error('Error in /start command:', error);
        await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Rută pentru health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
