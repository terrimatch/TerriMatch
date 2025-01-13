import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging pentru debugging
console.log('Starting TerriMatch server...');
console.log('Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('WebApp URL:', process.env.TELEGRAM_WEBAPP_URL);

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Handler pentru /start
bot.onText(/\/start/, async (msg) => {
    try {
        const welcomeMessage = `
🌟 Bine ai venit la TerriMatch!

Aici vei găsi:
💝 Persoane compatibile cu tine
💌 20 mesaje gratuite
🎥 Video chat pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:`;

        await bot.sendMessage(msg.chat.id, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{
                    text: "❤️ Deschide TerriMatch",
                    web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                }]]
            }
        });
        console.log('Welcome message sent to:', msg.chat.id);
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Handler pentru toate mesajele (debugging)
bot.on('message', (msg) => {
    console.log('Received message:', msg.text);
});

// Error handler pentru bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Rută pentru health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch bot is running',
        botActive: bot.isPolling()
    });
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Gestionare închidere grațioasă
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...');
    bot.stopPolling();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
