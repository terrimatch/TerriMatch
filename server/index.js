const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Verificare existență token
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN nu este setat!');
    process.exit(1);
}

// Configurare bot cu webhook
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
    webHook: {
        port: process.env.PORT || 3000
    }
});

// Middleware-uri
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route pentru verificarea stării serverului
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Route principal
app.get('/', (req, res) => {
    res.json({ 
        message: 'TerriMatch API este activ',
        version: '1.0.0'
    });
});

// Webhook handler
app.post('/webhook', async (req, res) => {
    try {
        await bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Eroare la procesarea webhook-ului:', error);
        res.sendStatus(500);
    }
});

// Handler pentru comanda /start
bot.onText(/\/start/, async (msg) => {
    try {
        const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉
Sunt aici să te ajut să găsești potrivirea perfectă.
        `;
        
        await bot.sendMessage(msg.chat.id, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "🚀 Deschide Aplicația",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                    }
                ]]
            }
        });
    } catch (error) {
        console.error('Eroare la trimiterea mesajului de start:', error);
        await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Error handling pentru întreaga aplicație
app.use((err, req, res, next) => {
    console.error('Eroare globală:', err);
    res.status(500).json({
        error: 'A apărut o eroare internă',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Încercați din nou mai târziu'
    });
});

// Pornire server doar dacă nu este în modul de test
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Serverul rulează pe portul ${port}`);
        console.log(`Webhook URL: ${process.env.TELEGRAM_WEBAPP_URL}/webhook`);
    });
}

module.exports = app;
