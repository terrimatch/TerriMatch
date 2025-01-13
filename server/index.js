const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Debug logs
console.log('Starting server...');
console.log('Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('Token length:', process.env.TELEGRAM_BOT_TOKEN?.length);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize bot with explicit error handling
let bot;
try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: {
            interval: 300,
            autoStart: true,
            params: {
                timeout: 10
            }
        }
    });
    console.log('Bot initialized successfully');
} catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
}

// Log all incoming messages
bot.on('message', (msg) => {
    console.log('Received message:', {
        text: msg.text,
        from: msg.from.id,
        chat: msg.chat.id,
        type: msg.chat.type
    });
});

// Start command handler
bot.onText(/\/start/, async (msg) => {
    console.log('Processing /start command');
    try {
        await bot.sendMessage(msg.chat.id, 
            '🌟 Bine ai venit la TerriMatch!\n\n' +
            '💝 20 mesaje gratuite\n' +
            '🎥 Video chat pentru 1 TerriCoin/minut\n\n' +
            'Apasă butonul de mai jos pentru a începe:',
            {
                reply_markup: {
                    inline_keyboard: [[{
                        text: "❤️ Deschide TerriMatch",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL || 'https://terri-match.vercel.app' }
                    }]]
                }
            }
        );
        console.log('Welcome message sent successfully');
    } catch (error) {
        console.error('Error sending welcome message:', error);
        // Încearcă să trimită un mesaj de eroare mai simplu
        try {
            await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        } catch (retryError) {
            console.error('Failed to send error message:', retryError);
        }
    }
});

// Error handlers
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        botInitialized: !!bot,
        polling: bot?.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Start server with explicit error handling
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Bot polling status:', bot?.isPolling());
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (bot) {
        bot.stopPolling();
    }
    server.close();
});

module.exports = app;
