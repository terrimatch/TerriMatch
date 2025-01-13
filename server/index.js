const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servește fișierele statice din frontend/build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 100,
        params: {
            timeout: 1
        }
    }
});

// Handler pentru /start
bot.onText(/^\/start$/i, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, '🚀 Bine ai venit la TerriMatch!', {
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
        console.error('Error in start command:', error);
    }
});

// API routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is running',
        botActive: bot.isPolling()
    });
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    if (!bot.isPolling()) {
        bot.startPolling();
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
