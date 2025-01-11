import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

app.use(cors());
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'API is working' });
});

// Webhook pentru Telegram
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Comanda /start
bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, 
            'Bine ai venit la TerriMatch!',
            {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Deschide App",
                            web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                        }
                    ]]
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
});

// Set webhook for production
if (process.env.VERCEL_URL) {
    bot.setWebHook(`https://${process.env.VERCEL_URL}/webhook`);
}

export default app;
