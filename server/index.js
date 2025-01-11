const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Logging pentru debugging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Webhook URL:', process.env.TELEGRAM_WEBAPP_URL);

// Verificare token
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN nu este setat');
    process.exit(1);
}

// Configurare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: {
        port: process.env.PORT || 3000
    }
});

// Setare webhook URL
const webhookUrl = `${process.env.TELEGRAM_WEBAPP_URL}/webhook`;
bot.setWebHook(webhookUrl).then(() => {
    console.log('Webhook setat cu succes:', webhookUrl);
}).catch(error => {
    console.error('Eroare la setarea webhook:', error);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Rute
app.get('/', (req, res) => {
    console.log('Request la ruta principală');
    res.json({
        status: 'ok',
        message: 'TerriMatch API este activ'
    });
});

app.get('/health', (req, res) => {
    console.log('Health check request');
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

app.post('/webhook', async (req, res) => {
    console.log('Webhook request primit:', JSON.stringify(req.body));
    try {
        await bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Eroare la procesarea webhook:', error);
        res.sendStatus(500);
    }
});

// Comenzi bot
bot.onText(/\/start/, async (msg) => {
    console.log('Comandă /start primită de la:', msg.from.id);
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
        console.log('Mesaj de bun venit trimis cu succes');
    } catch (error) {
        console.error('Eroare la trimiterea mesajului de start:', error);
        await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Eroare globală:', err);
    res.status(500).json({
        error: 'Eroare internă',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Încercați mai târziu'
    });
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server pornit pe portul ${port}`);
});

module.exports = app;
