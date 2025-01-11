const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Logging inițial
console.log('Server pornit cu următoarele configurări:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('WEBHOOK_URL:', `${process.env.TELEGRAM_WEBAPP_URL}/webhook`);

// Configurare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: {
        host: '0.0.0.0',
        port: process.env.PORT || 3000
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware pentru toate request-urile
app.use((req, res, next) => {
    console.log('Request primit:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Rută principală
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API este activ'
    });
});

// Rută pentru webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook primit:', JSON.stringify(req.body, null, 2));
    
    if (req.body && req.body.message) {
        console.log('Mesaj primit:', req.body.message);
        
        // Procesare update
        bot.processUpdate(req.body);
        
        // Verificare pentru comanda /start
        if (req.body.message.text === '/start') {
            console.log('Comandă /start detectată');
            handleStart(req.body.message);
        }
    } else {
        console.log('Update invalid primit la webhook');
    }
    
    res.sendStatus(200);
});

// Handler pentru comanda /start
async function handleStart(message) {
    try {
        console.log('Procesare comandă /start pentru chat ID:', message.chat.id);
        
        const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉
Sunt aici să te ajut să găsești potrivirea perfectă.
        `;
        
        await bot.sendMessage(message.chat.id, welcomeMessage, {
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
        try {
            await bot.sendMessage(message.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        } catch (sendError) {
            console.error('Eroare la trimiterea mesajului de eroare:', sendError);
        }
    }
}

// Setare webhook la pornirea serverului
const webhookUrl = `${process.env.TELEGRAM_WEBAPP_URL}/webhook`;
bot.setWebHook(webhookUrl).then(() => {
    console.log('Webhook setat cu succes la:', webhookUrl);
}).catch(error => {
    console.error('Eroare la setarea webhook-ului:', error);
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server pornit pe portul ${port}`);
});

module.exports = app;
