module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
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
            font-family: system-ui;
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
            margin: 20px 0;
        }
        input, select {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
        }
        button {
            width: 100%;
            padding: 15px;
            background: #0062ff;
            border: none;
            border-radius: 20px;
            color: white;
            font-size: 18px;
            margin-top: 20px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>❤️<br>TerriMatch</h1>
        <div class="card">
            <input type="text" id="name" placeholder="Numele tău">
            <input type="number" id="age" placeholder="Vârsta">
            <select id="gender">
                <option value="">Selectează genul</option>
                <option value="male">Bărbat</option>
                <option value="female">Femeie</option>
            </select>
            <input type="text" id="city" placeholder="Orașul">
            <button onclick="save()">Salvează</button>
        </div>
    </div>

    <script>
        const tg = window.Telegram.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
        }

        function save() {
            if (tg) {
                const data = {
                    name: document.getElementById('name').value,
                    age: document.getElementById('age').value,
                    gender: document.getElementById('gender').value,
                    city: document.getElementById('city').value
                };
                tg.sendData(JSON.stringify(data));
                tg.close();
            }
        }
    </script>
</body>
</html>
    `);
};
