const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Logging la pornire
console.log('=== SERVER STARTING ===');
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TELEGRAM_WEBAPP_URL:', process.env.TELEGRAM_WEBAPP_URL);
console.log('Bot token length:', process.env.TELEGRAM_BOT_TOKEN?.length || 'not set');

// Configurare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: {
        host: '0.0.0.0',
        port: process.env.PORT || 3000
    }
});

// Verificare conectivitate bot
bot.getMe()
    .then(botInfo => {
        console.log('Bot conectat cu succes:', botInfo);
    })
    .catch(error => {
        console.error('Eroare la conectarea botului:', error);
    });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        botToken: process.env.TELEGRAM_BOT_TOKEN ? 'present' : 'missing',
        webhookUrl: `${process.env.TELEGRAM_WEBAPP_URL}/webhook`
    });
});

// Webhook route
app.post('/webhook', (req, res) => {
    console.log('=== WEBHOOK CALLED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    if (!req.body) {
        console.log('No body received');
        return res.sendStatus(400);
    }

    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Handler pentru comanda /start
bot.onText(/\/start/, async (msg) => {
    console.log('=== START COMMAND RECEIVED ===');
    console.log('From user:', msg.from);
    
    try {
        const welcomeMessage = 'Bine ai venit la TerriMatch! 🎉';
        await bot.sendMessage(msg.chat.id, welcomeMessage);
        console.log('Welcome message sent successfully');
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('=== ERROR OCCURRED ===');
    console.error('Error details:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Setare webhook
const webhookUrl = `${process.env.TELEGRAM_WEBAPP_URL}/webhook`;
bot.setWebHook(webhookUrl).then(() => {
    console.log('Webhook set successfully to:', webhookUrl);
}).catch(error => {
    console.error('Error setting webhook:', error);
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
