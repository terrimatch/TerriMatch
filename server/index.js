const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inițializare Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Inițializare bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
    polling: true 
});

// Logging pentru debugging
console.log('Server starting...');
console.log('Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('Supabase URL exists:', !!process.env.SUPABASE_URL);

// Handler pentru /start
bot.onText(/\/start/, async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, 
            '🌟 Bine ai venit la TerriMatch!\n\n' +
            '💝 20 mesaje gratuite\n' +
            '🎥 Video chat pentru 1 TerriCoin/minut\n\n' +
            'Apasă butonul pentru a începe:', {
            reply_markup: {
                inline_keyboard: [[{
                    text: "❤️ Deschide TerriMatch",
                    web_app: { url: process.env.TELEGRAM_WEBAPP_URL }
                }]]
            }
        });
    } catch (error) {
        console.error('Error in /start command:', error);
    }
});

// Rută pentru înregistrare
app.post('/api/register', async (req, res) => {
    try {
        const userData = req.body;
        console.log('Registering user:', userData);

        const { data, error } = await supabase
            .from('profiles')
            .upsert([{
                telegram_id: userData.telegram_id,
                name: userData.name,
                birthdate: userData.birthdate,
                gender: userData.gender,
                bio: userData.bio,
                location: userData.location,
                registration_completed: true
            }]);

        if (error) throw error;
        res.json({ success: true });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Rută pentru health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        botActive: bot?.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

// Export pentru Vercel
module.exports = app;
