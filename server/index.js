const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rute simple pentru test
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running'
    });
});

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is active'
    });
});

// Inițializare bot
if (process.env.TELEGRAM_BOT_TOKEN) {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: true
    });

    // Handler pentru comanda /start
    bot.on('message', async (msg) => {
        console.log('Received message:', msg);
        
        if (msg.text === '/start') {
            const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉

Sunt aici să te ajut să găsești potrivirea perfectă pentru terenul tău. 

Apasă butonul de mai jos pentru a începe:`;
            
            try {
                await bot.sendMessage(msg.chat.id, welcomeMessage, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: "🌍 Deschide TerriMatch",
                                web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                            }
                        ]]
                    }
                });
                console.log('Welcome message sent successfully');
            } catch (error) {
                console.error('Error sending welcome message:', error);
                await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
            }
        }
    });

    // Logging pentru debugging
    bot.on('polling_error', (error) => {
        console.error('Polling error:', error);
    });

    bot.on('webhook_error', (error) => {
        console.error('Webhook error:', error);
    });

} else {
    console.error('TELEGRAM_BOT_TOKEN nu este setat!');
}

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Webapp URL:', process.env.TELEGRAM_WEBAPP_URL);
});

module.exports = app;
