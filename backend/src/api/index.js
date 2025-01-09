import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';
import authRoutes from './auth/routes.js';
import profileRoutes from './profiles/routes.js';
import matchRoutes from './matches/routes.js';
import chatRoutes from './chat/routes.js';
import notificationRoutes from './notifications/routes.js';
import telegramRoutes from './telegram/routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    useTempFiles: true
}));

// Base API test route
app.get('/api', (req, res) => {
    res.json({
        status: 'alive',
        message: 'TerriMatch API is working',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/telegram', telegramRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
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

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Health check available at http://localhost:${port}/api/health`);
    });
}

export default app;
