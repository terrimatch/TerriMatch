const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

// Inițializare bot cu configurare optimizată
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 100, // Poll mai frecvent
        params: {
            timeout: 1 // Timeout mai scurt pentru răspuns rapid
        }
    }
});

// Cache pentru a evita răspunsuri duplicate
const messageCache = new Set();
const CACHE_TIMEOUT = 1000; // 1 secundă

// Handler direct pentru /start
bot.onText(/^\/start$/i, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = `${chatId}-${msg.message_id}`;

    // Verifică dacă mesajul a fost deja procesat recent
    if (messageCache.has(messageId)) {
        return;
    }

    // Adaugă în cache
    messageCache.add(messageId);
    setTimeout(() => messageCache.delete(messageId), CACHE_TIMEOUT);

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
        try {
            await bot.sendMessage(chatId, 'Te rog încearcă din nou.');
        } catch (retryError) {
            console.error('Retry error:', retryError);
        }
    }
});

// Monitorizare activă a stării botului
setInterval(() => {
    if (!bot.isPolling()) {
        console.log('Restarting polling...');
        bot.startPolling();
    }
}, 5000);

// Handler pentru erori de polling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    // Repornește polling-ul automat
    if (!bot.isPolling()) {
        bot.startPolling();
    }
});

// Rută de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        botActive: bot.isPolling()
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
