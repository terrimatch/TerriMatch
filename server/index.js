const express = require('express');
const app = express();

app.use(express.json());

// Rută pentru verificare server
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Rută principală care servește interfața web
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
                    background: linear-gradient(135deg, #0062ff 0%, #001B69 100%);
                    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto;
                    color: white;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .logo {
                    text-align: center;
                    font-size: 48px;
                    margin: 20px 0;
                }
                .card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .features {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                .feature {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 15px;
                    text-align: center;
                }
                .button {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    background: #0062ff;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .button:hover {
                    transform: translateY(-2px);
                }
                .input-group {
                    margin-bottom: 15px;
                }
                .input-group label {
                    display: block;
                    margin-bottom: 5px;
                }
                .input-group input, 
                .input-group select {
                    width: 100%;
                    padding: 10px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .text-center {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">❤️</div>
                <h1 class="text-center">TerriMatch</h1>
                
                <div class="features">
                    <div class="feature">
                        <h3>Chat</h3>
                        <p>20 mesaje gratuite</p>
                    </div>
                    <div class="feature">
                        <h3>Video Chat</h3>
                        <p>1 TerriCoin/min</p>
                    </div>
                    <div class="feature">
                        <h3>Matches</h3>
                        <p>Nelimitat</p>
                    </div>
                </div>

                <div class="card">
                    <h2>Completează Profilul</h2>
                    <div class="input-group">
                        <label>Nume</label>
                        <input type="text" id="name" placeholder="Numele tău">
                    </div>
                    <div class="input-group">
                        <label>Vârstă</label>
                        <input type="number" id="age" min="18">
                    </div>
                    <div class="input-group">
                        <label>Gen</label>
                        <select id="gender">
                            <option value="">Selectează</option>
                            <option value="male">Bărbat</option>
                            <option value="female">Femeie</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Oraș</label>
                        <input type="text" id="city" placeholder="Orașul tău">
                    </div>
                    <button class="button" onclick="saveProfile()">Finalizează</button>
                </div>
            </div>

            <script>
                const tg = window.Telegram.WebApp;
                
                if (tg) {
                    tg.ready();
                    tg.expand();
                }

                function saveProfile() {
                    const name = document.getElementById('name').value;
                    const age = document.getElementById('age').value;
                    const gender = document.getElementById('gender').value;
                    const city = document.getElementById('city').value;

                    if (!name || !age || !gender || !city) {
                        tg.showPopup({
                            title: 'Eroare',
                            message: 'Te rugăm să completezi toate câmpurile',
                            buttons: [{text: 'OK'}]
                        });
                        return;
                    }

                    const data = {
                        name,
                        age,
                        gender,
                        city,
                        telegram_id: tg.initDataUnsafe?.user?.id
                    };

                    tg.sendData(JSON.stringify(data));
                    tg.close();
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = app;
