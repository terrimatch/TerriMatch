const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging pentru debugging
console.log('Starting server with following config:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Bot token length:', process.env.TELEGRAM_BOT_TOKEN?.length || 'not set');
console.log('Webapp URL:', process.env.TELEGRAM_WEBAPP_URL);

// Rută principală
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is active'
    });
});

// Rută de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        botInitialized: !!global.bot
    });
});

// Inițializare bot într-o funcție separată
function initializeBot() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set!');
        return null;
    }

    try {
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            polling: true
        });

        // Logging pentru debugging
        bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });

        bot.on('error', (error) => {
            console.error('Bot error:', error);
        });

        // Handler pentru /start
        bot.onText(/\/start/, async (msg) => {
            console.log('Received /start command from:', msg.chat.id);
            
            try {
                const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉

Sunt aici să te ajut să găsești potrivirea perfectă pentru terenul tău.
`;
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
                console.log('Welcome message sent successfully');
            } catch (error) {
                console.error('Error sending welcome message:', error);
                try {
                    await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
                } catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        });

        // Handler pentru orice mesaj
        bot.on('message', (msg) => {
            console.log('Received message:', msg);
        });

        console.log('Bot initialized successfully');
        return bot;
    } catch (error) {
        console.error('Error initializing bot:', error);
        return null;
    }
}

// Inițializare bot și salvare în variabilă globală
global.bot = initializeBot();

// Error handler pentru Express
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    if (global.bot) {
        global.bot.stopPolling();
    }
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
