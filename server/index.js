const express = require('express');
const app = express();

// Middleware minim
app.use(express.json());

// Rută simplă pentru test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Rută pentru înregistrare
app.post('/api/register', async (req, res) => {
    try {
        console.log('Registration data received:', req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Servește HTML static
app.get('/', (req, res) => {
    res.send(`
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
                    background: linear-gradient(145deg, #001B69, #0062ff);
                    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto;
                    color: white;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: center;
                }
                .card {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    margin: 20px 0;
                }
                .button {
                    background: #0062ff;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 18px;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>TerriMatch</h1>
                <div class="card">
                    <h2>Bine ai venit!</h2>
                    <p>Găsește sufletul pereche perfect pentru tine</p>
                    <button class="button" onclick="startApp()">Începe</button>
                </div>
            </div>
            <script>
                const tg = window.Telegram.WebApp;
                if (tg) {
                    tg.ready();
                    tg.expand();
                }

                function startApp() {
                    if (tg) {
                        tg.sendData(JSON.stringify({action: 'start'}));
                        tg.close();
                    }
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = app;
