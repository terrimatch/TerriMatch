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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            websocket: io ? 'connected' : 'disconnected'
        }
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('WebSocket server initialized');
});
