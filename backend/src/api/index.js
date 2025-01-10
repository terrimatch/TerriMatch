import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import bot from '../services/telegramService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Telegram webhook endpoint
app.post('/api/telegram-webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Set webhook if on Vercel
if (process.env.VERCEL_URL) {
    const webhookUrl = `https://${process.env.VERCEL_URL}/api/telegram-webhook`;
    bot.setWebHook(webhookUrl).catch(console.error);
}

export default app;
