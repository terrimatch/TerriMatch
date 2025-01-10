import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();

// Configurare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: true
});

// Middleware
app.use(cors());
app.use(express.json());

// Rută de bază pentru test
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'TerriMatch API is running' });
});

// Telegram webhook
app.post('/webhook', express.json(), (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Inițializare comenzi bot
bot.setMyCommands([
    { command: '/start', description: 'Deschide aplicația' }
]);

// Handler pentru comanda /start
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
        console.error('Error in /start command:', error);
        await bot.sendMessage(chatId, 'A apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Setare webhook
if (process.env.VERCEL_URL) {
    const webhookUrl = `https://${process.env.VERCEL_URL}/webhook`;
    bot.setWebHook(webhookUrl).then(() => {
        console.log('Webhook set:', webhookUrl);
    }).catch(console.error);
}

// Export pentru Vercel
export default app;
