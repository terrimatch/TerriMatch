import { Server } from 'socket.io';
import { supabase } from '../config/supabaseClient.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join personal room for notifications
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their personal room`);
        });

        // Join chat room
        socket.on('join_chat', (conversationId) => {
            socket.join(`chat_${conversationId}`);
            console.log(`User joined chat ${conversationId}`);
        });

        // Leave chat room
        socket.on('leave_chat', (conversationId) => {
            socket.leave(`chat_${conversationId}`);
            console.log(`User left chat ${conversationId}`);
        });

        // Typing status
        socket.on('typing', ({ conversationId, userId, isTyping }) => {
            socket.to(`chat_${conversationId}`).emit('user_typing', { userId, isTyping });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

// Function to emit new message notification
export const emitNewMessage = (conversationId, message) => {
    if (io) {
        io.to(`chat_${conversationId}`).emit('new_message', message);
    }
};

// Function to emit match notification
export const emitNewMatch = (userId, matchData) => {
    if (io) {
        io.to(`user_${userId}`).emit('new_match', matchData);
    }
};

// Function to emit general notification
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
};
