import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();

// Bot configuration
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: true
});

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'TerriMatch API is running',
        timestamp: new Date().toISOString()
    });
});

// Webhook route
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendMessage(chatId, 
            'Bine ai venit la TerriMatch! 👋\n\n' +
            'Apasă butonul de mai jos pentru a deschide aplicația:',
            {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Deschide TerriMatch",
                            web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                        }
                    ]]
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
        await bot.sendMessage(chatId, 'A apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Set webhook for production
if (process.env.VERCEL_URL) {
    const webhookUrl = `https://${process.env.VERCEL_URL}/webhook`;
    bot.setWebHook(webhookUrl);
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
