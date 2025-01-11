const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, 'Bine ai venit!', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Deschide App",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                    }
                ]]
            }
        });
    } catch (error) {
        console.error(error);
    }
});

module.exports = app;
