const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rute simple pentru test
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running'
    });
});

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is active'
    });
});

// Inițializare bot doar dacă avem token
if (process.env.TELEGRAM_BOT_TOKEN) {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: true // Folosim polling în loc de webhook pentru început
    });

    bot.on('message', async (msg) => {
        console.log('Received message:', msg);
        
        if (msg.text === '/start') {
            await bot.sendMessage(msg.chat.id, 'Bine ai venit la TerriMatch! 🎉');
        }
    });
} else {
    console.error('TELEGRAM_BOT_TOKEN nu este setat!');
}

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
