import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

// Initialize Express
const app = express();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: {
        port: process.env.PORT || 3000
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Base route for health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'TerriMatch API is running',
        timestamp: new Date().toISOString()
    });
});

// API Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Telegram Webhook endpoint
app.post('/webhook', (req, res) => {
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// Start command handler
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const welcomeMessage = 'Bine ai venit la TerriMatch! 👋\n\n' +
                             'Apasă butonul de mai jos pentru a deschide aplicația:';
        
        await bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Deschide TerriMatch",
                        web_app: {
                            url: process.env.TELEGRAM_WEBAPP_URL || 'https://terrimatch.vercel.app'
                        }
                    }
                ]]
            },
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error in /start command:', error);
        await bot.sendMessage(chatId, 'A apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Set webhook in production
if (process.env.VERCEL_URL) {
    const webhookUrl = `https://${process.env.VERCEL_URL}/webhook`;
    bot.setWebHook(webhookUrl).then(() => {
        console.log('Webhook set successfully:', webhookUrl);
    }).catch(error => {
        console.error('Failed to set webhook:', error);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

export default app;
