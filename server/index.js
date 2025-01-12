const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// Inițializare Express
const app = express();

// Verificare variabile de mediu
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN missing');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Inițializare bot cu polling forțat și timeout mare
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Logging pentru debugging
console.log('Bot initialized with token length:', process.env.TELEGRAM_BOT_TOKEN.length);

// Handler pentru erori de polling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    // Repornește polling-ul în caz de eroare
    bot.startPolling();
});

// Handler pentru orice mesaj (pentru debugging)
bot.on('message', (msg) => {
    console.log('Received message:', msg.text, 'from:', msg.from.id);
});

// Handler specific pentru comanda /start
bot.onText(/\/start/, async (msg) => {
    console.log('Received /start command from:', msg.from.id);
    try {
        const welcomeMessage = `
🎉 Bine ai venit la TerriMatch!

Găsește-ți sufletul pereche perfect pentru tine.
💝 20 mesaje gratuite pentru început
🎥 Video chat disponibil pentru 1 TerriCoin/minut

Apasă butonul de mai jos pentru a începe:
        `;
        
        await bot.sendMessage(msg.chat.id, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "💘 Deschide TerriMatch",
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
        } catch (retryError) {
            console.error('Error sending error message:', retryError);
        }
    }
});

// Rută pentru health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        botActive: bot.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Handler pentru închidere grațioasă
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    bot.stopPolling();
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Bot polling:', bot.isPolling());
    
    // Verifică starea bot-ului la fiecare 5 minute
    setInterval(() => {
        if (!bot.isPolling()) {
            console.log('Bot not polling, restarting...');
            bot.startPolling();
        }
    }, 300000);
});

module.exports = app;
