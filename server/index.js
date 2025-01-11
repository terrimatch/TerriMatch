const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// Import routes
const matchesRoutes = require('./api/matches/routes');
const telegramRoutes = require('./api/telegram/routes');
const chatRoutes = require('./api/chat/routes');
const profileRoutes = require('./api/profiles/routes');
const authRoutes = require('./api/auth/routes');

// Import services
const { testConnection } = require('./config/supabase');
const notificationService = require('./services/notificationService');
const matchingService = require('./services/matchingService');

// Verificare variabile mediu necesare
const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_WEBAPP_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Supabase connection
testConnection().then(connected => {
    if (!connected) {
        console.error('Could not connect to Supabase');
        process.exit(1);
    }
    console.log('Successfully connected to Supabase');
});

// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Static files middleware pentru frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profiles', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TerriMatch API is active',
        version: '1.0.0'
    });
});

// Inițializare Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

// Handler pentru comenzi bot
bot.on('message', async (msg) => {
    console.log('Received message:', msg);

    if (msg.text === '/start') {
        try {
            const welcomeMessage = `
Bine ai venit la TerriMatch! 🎉

Sunt aici să te ajut să găsești potrivirea perfectă pentru terenul tău. 
Pentru a începe, trebuie să-ți completezi profilul.

Apasă butonul de mai jos pentru a continua:`;
            
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
            
            // Log successful interaction
            console.log('Welcome message sent to:', msg.chat.id);
        } catch (error) {
            console.error('Error handling /start command:', error);
            await bot.sendMessage(msg.chat.id, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
        }
    } else if (msg.text === '/help') {
        try {
            const helpMessage = `
Comenzi disponibile:
/start - Începe conversația și deschide aplicația
/help - Afișează acest mesaj de ajutor
/profile - Vizualizează și editează profilul tău
/matches - Vezi matchurile tale actuale
/settings - Configurează setările notificărilor
            `;
            
            await bot.sendMessage(msg.chat.id, helpMessage);
        } catch (error) {
            console.error('Error sending help message:', error);
        }
    }
});

// Error handling pentru bot
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

bot.on('webhook_error', (error) => {
    console.error('Bot webhook error:', error);
});

// Global error handling pentru Express
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Nu expune detalii de eroare în producție
    const errorMessage = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'A apărut o eroare internă';
    
    res.status(500).json({
        error: 'Internal server error',
        message: errorMessage
    });
});

// Catch 404 și redirecționare la frontend pentru rutele necunoscute
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Pornire server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`
    =================================
    🚀 TerriMatch Server is running
    🌐 Port: ${port}
    🔧 Environment: ${process.env.NODE_ENV}
    📱 Webapp URL: ${process.env.TELEGRAM_WEBAPP_URL}
    =================================
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Performing graceful shutdown...');
    bot.stopPolling();
    process.exit(0);
});

module.exports = app;
