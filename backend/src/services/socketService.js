import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Join personal room for notifications
        socket.join(`user:${socket.userId}`);

        // Join chat rooms
        socket.on('join_chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        // Leave chat rooms
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`User ${socket.userId} left chat ${chatId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });

    return io;
};

export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
    }
};

export const emitChatMessage = (chatId, message) => {
    if (io) {
        io.to(`chat:${chatId}`).emit('chat_message', message);
    }
};

export const emitMatchUpdate = (userId, matchData) => {
    if (io) {
        io.to(`user:${userId}`).emit('match_update', matchData);
    }
};

export const emitTypingStatus = (chatId, userId, isTyping) => {
    if (io) {
        io.to(`chat:${chatId}`).emit('typing_status', { userId, isTyping });
    }
};