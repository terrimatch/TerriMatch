const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 100,
        params: {
            timeout: 1
        }
    }
});

// Logging pentru debugging
console.log('Starting server...');
console.log('Bot token:', process.env.TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
console.log('WebApp URL:', process.env.TELEGRAM_WEBAPP_URL);

// Handler pentru comanda /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendMessage(chatId, `
🎉 Bine ai venit la TerriMatch!

📱 Găsește sufletul pereche perfect pentru tine
💌 20 mesaje gratuite
🎥 Video chat pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{
                    text: '❤️ Începe Aventura',
                    web_app: { url: 'https://terrimatch.vercel.app' }
                }]]
            }
        });
        console.log('Welcome message sent successfully to:', chatId);
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Single endpoint pentru health check
app.get('*', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch bot is running'
    });
});

// Error handling pentru bot
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('SIGTERM', () => {
    bot.stopPolling();
    server.close();
});

module.exports = app;
