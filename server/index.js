module.exports = (req, res) => {
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
            text-align: center;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
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
        .input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: white;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 20px 0;
        }
        .stat {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>❤️</h1>
        <h1>TerriMatch</h1>
        
        <div class="stats">
            <div class="stat">
                <h3>Chat</h3>
                <p>20 mesaje gratuite</p>
            </div>
            <div class="stat">
                <h3>Video</h3>
                <p>1 TerriCoin/min</p>
            </div>
            <div class="stat">
                <h3>Matches</h3>
                <p>Nelimitat</p>
            </div>
        </div>

        <div class="card">
            <h2>Completează Profilul</h2>
            <input type="text" class="input" id="name" placeholder="Numele tău">
            <input type="number" class="input" id="age" placeholder="Vârsta">
            <select class="input" id="gender">
                <option value="">Selectează genul</option>
                <option value="male">Bărbat</option>
                <option value="female">Femeie</option>
            </select>
            <input type="text" class="input" id="city" placeholder="Orașul">
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
            const data = {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                city: document.getElementById('city').value
            };

            if (tg) {
                if (!data.name || !data.age || !data.gender || !data.city) {
                    tg.showPopup({
                        title: 'Completează toate câmpurile',
                        message: 'Te rugăm să completezi toate informațiile cerute.',
                        buttons: [{text: 'OK'}]
                    });
                    return;
                }

                tg.sendData(JSON.stringify(data));
                tg.close();
            }
        }
    </script>
</body>
</html>
    `);
};
