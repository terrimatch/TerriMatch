import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';
import bot from '../services/telegramService.js';
import { initializeSocket } from '../services/socketService.js';
import authRoutes from './auth/routes.js';
import profileRoutes from './profiles/routes.js';
import matchRoutes from './matches/routes.js';
import chatRoutes from './chat/routes.js';
import notificationRoutes from './notifications/routes.js';
import telegramRoutes from './telegram/routes.js';
import reportRoutes from './reports/routes.js';
import moderationRoutes from './moderation/routes.js';
import adminRoutes from './admin/routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Set up Telegram webhook if on Vercel
if (process.env.VERCEL_URL) {
    const webhookUrl = `https://${process.env.VERCEL_URL}/api/telegram-webhook`;
    bot.setWebHook(webhookUrl).then(() => {
        console.log('Telegram webhook set:', webhookUrl);
    }).catch(error => {
        console.error('Error setting webhook:', error);
    });
}

// Telegram webhook endpoint
app.post('/api/telegram-webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            telegram: bot.isPolling() ? 'connected' : 'disconnected',
            socket: io ? 'connected' : 'disconnected'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Health check available at http://localhost:${PORT}/api/health`);
        if (process.env.NODE_ENV === 'development') {
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        }
    });
}

export default app;
