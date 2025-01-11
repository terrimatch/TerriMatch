const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const matchesRoutes = require('./api/matches/routes');
const telegramRoutes = require('./api/telegram/routes');
const chatRoutes = require('./api/chat/routes'); // Adăugat nou

// ... (cod existent) ...

// Configurare rute API
app.use('/api/matches', matchesRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/chat', chatRoutes); // Adăugat nou

// ... (restul codului rămâne la fel) ...

// Import routes
const matchesRoutes = require('./api/matches/routes');
const telegramRoutes = require('./api/telegram/routes');

// Import services
const { testConnection } = require('./config/supabase');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Supabase connection
testConnection().then(connected => {
    if (!connected) {
        console.error('Could not connect to Supabase');
        process.exit(1);
    }
});

// Inițializare bot
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN missing');
    process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Configurare rute API
app.use('/api/matches', matchesRoutes);
app.use('/api/telegram', telegramRoutes);

// Rută de bază
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is active'
    });
});

// Handler pentru comanda /start
bot.on('message', async (msg) => {
    if (msg.text === '/start') {
        try {
            const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉

Sunt aici să te ajut să găsești potrivirea perfectă pentru terenul tău. 

Apasă butonul de mai jos pentru a începe:`;
            
            await bot.sendMessage(msg.chat.id, welcomeMessage, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "🌍 Deschide TerriMatch",
                            web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                        }
                    ]]
                }
            });
        } catch (error) {
            console.error('Error sending welcome message:', error);
            await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        }
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Webapp URL:', process.env.TELEGRAM_WEBAPP_URL);
});

module.exports = app;
