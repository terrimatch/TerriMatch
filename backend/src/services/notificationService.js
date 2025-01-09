import { supabase } from '../config/supabaseClient.js';
import { sendTelegramNotification } from './telegramService.js';
import { emitNotification, emitMatchUpdate } from './socketService.js';

export const createNotification = async (userId, type, content, data = {}) => {
    try {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                type,
                content,
                data,
                read: false
            }])
            .select()
            .single();

        if (error) throw error;

        // Emit real-time notification
        emitNotification(userId, notification);

        // Send Telegram notification if enabled
        await sendTelegramNotification(userId, content);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

export const createMatchNotification = async (user1Id, user2Id) => {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', [user1Id, user2Id]);

        if (error) throw error;

        const user1 = profiles.find(p => p.id === user1Id);
        const user2 = profiles.find(p => p.id === user2Id);

        // Create notifications for both users
        const notification1 = await createNotification(
            user1Id,
            'new_match',
            `Ai un nou match cu ${user2.username}!`,
            { matchedUserId: user2Id }
        );

        const notification2 = await createNotification(
            user2Id,
            'new_match',
            `Ai un nou match cu ${user1.username}!`,
            { matchedUserId: user1Id }
        );

        // Emit match updates
        emitMatchUpdate(user1Id, {
            matchedUser: user2,
            notification: notification1
        });

        emitMatchUpdate(user2Id, {
            matchedUser: user1,
            notification: notification2
        });
    } catch (error) {
        console.error('Error creating match notifications:', error);
    }
};

export const createMessageNotification = async (recipientId, senderId, messagePreview) => {
    try {
        const { data: sender, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', senderId)
            .single();

        if (error) throw error;

        await createNotification(
            recipientId,
            'new_message',
            `Mesaj nou de la ${sender.username}`,
            {
                senderId,
                messagePreview: messagePreview.substring(0, 50)
            }
        );
    } catch (error) {
        console.error('Error creating message notification:', error);
    }
};

export const createSystemNotification = async (userId, title, message) => {
    try {
        await createNotification(
            userId,
            'system',
            title,
            { message }
        );
    } catch (error) {
        console.error('Error creating system notification:', error);
    }
};