const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Handler pentru comanda /start
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
        console.log('Welcome message sent to:', msg.chat.id);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Rută pentru înregistrare
app.post('/api/register', async (req, res) => {
    try {
        const userData = req.body;
        
        // Salvare în Supabase
        const { data, error } = await supabase
            .from('profiles')
            .upsert([
                {
                    telegram_id: userData.telegram_id,
                    name: userData.name,
                    birthdate: userData.birthdate,
                    gender: userData.gender,
                    bio: userData.bio,
                    location: userData.location,
                    registration_completed: true,
                    last_active: new Date()
                }
            ]);

        if (error) throw error;

        // Trimite notificare prin bot
        try {
            await bot.sendMessage(userData.telegram_id, 
                '🎉 Felicitări! Profilul tău a fost creat cu succes!\n\n' +
                'Acum poți începe să folosești TerriMatch pentru a găsi persoane compatibile.'
            );
        } catch (botError) {
            console.error('Error sending bot message:', botError);
        }

       res.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Eroare la înregistrare' });
    }
});

// Rută pentru upload poze
app.post('/api/upload-photo', async (req, res) => {
    try {
        const { telegram_id, photo_index, photo_data } = req.body;
        
        // Salvare poză în Supabase Storage
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(`${telegram_id}/photo${photo_index}`, photo_data);

        if (error) throw error;

        // Actualizare profil cu URL-ul pozei
        const photoUrl = supabase.storage
            .from('profile-photos')
            .getPublicUrl(`${telegram_id}/photo${photo_index}`).data.publicUrl;

        await supabase
            .from('profiles')
            .update({ [`photo${photo_index}_url`]: photoUrl })
            .eq('telegram_id', telegram_id);

        res.json({ success: true, url: photoUrl });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: 'Eroare la încărcarea pozei' });
    }
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

// Rută pentru health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        botActive: bot.isPolling(),
        timestamp: new Date().toISOString()
    });
});

// Servește aplicația web
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Pornire server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Bot polling:', bot.isPolling());
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    bot.stopPolling();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
