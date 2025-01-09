import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';
import { initializeSocket } from './services/socketService.js';
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

// Initialize Socket.IO with server
const io = initializeSocket(httpServer);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
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
            database: 'connected',
            socket: io ? 'connected' : 'disconnected'
        }
    });
});

// Rate limiting middleware
const rateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

app.use('/api/', rateLimit);

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

const PORT = process.env.PORT || 3001;

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
    
    if (process.env.NODE_ENV === 'development') {
        console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing HTTP server...');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

export default app;