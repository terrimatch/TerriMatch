const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 100,
        params: {
            timeout: 1
        }
    }
});

// Ruta principală - returnează HTML direct
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>TerriMatch</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                min-height: 100vh;
                background: linear-gradient(135deg, #ff6b6b 0%, #556270 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: white;
            }
            .container {
                text-align: center;
                padding: 20px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            .button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                color: white;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>TerriMatch</h1>
            <p>Găsește sufletul pereche perfect pentru tine</p>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>Chat</h3>
                    <p>20 mesaje gratuite</p>
                </div>
                <div class="stat-card">
                    <h3>Video Chat</h3>
                    <p>1 TerriCoin/min</p>
                </div>
                <div class="stat-card">
                    <h3>Matches</h3>
                    <p>Nelimitat</p>
                </div>
            </div>
            
            <button class="button" onclick="startApp()">Începe Aventura</button>
        </div>

        <script>
            function startApp() {
                const tg = window.Telegram.WebApp;
                if (tg) {
                    tg.ready();
                    tg.expand();
                    tg.MainButton.setText('Începe');
                    tg.MainButton.show();
                }
            }
            
            // Initialize Telegram WebApp
            const tg = window.Telegram.WebApp;
            if (tg) {
                tg.ready();
                tg.expand();
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// Handler pentru /start
bot.onText(/^\/start$/i, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, '🚀 Bine ai venit la TerriMatch!', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "💝 Deschide TerriMatch",
                        web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                    }
                ]]
            }
        });
    } catch (error) {
        console.error('Error in start command:', error);
    }
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    if (!bot.isPolling()) {
        bot.startPolling();
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
