import webpush from 'web-push';
import { supabase } from '../config/supabaseClient.js';

// Push Notification Functions
export const sendPushNotification = async (userId, notification) => {
    try {
        // Get user's notification settings
        const { data: settings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Check if user wants this type of notification
        if (settings && !settings[notification.type]) {
            return;
        }

        // Get user's push subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId);

        if (error) throw error;

        // Send to all user's subscriptions
        const notificationPromises = subscriptions.map(sub => 
            webpush.sendNotification(
                sub.subscription,
                JSON.stringify({
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon,
                    data: notification.data
                })
            ).catch(err => {
                if (err.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    return supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', userId)
                        .eq('subscription', sub.subscription);
                }
                throw err;
            })
        );

        await Promise.all(notificationPromises);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

// In-App Notification Functions
export const createInAppNotification = async (data) => {
    try {
        const { error } = await supabase
            .from('in_app_notifications')
            .insert([{
                recipient_id: data.recipientId,
                sender_id: data.senderId,
                type: data.type,
                title: data.title,
                content: data.content,
                data: data.additionalData || {},
                read: false
            }]);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error creating in-app notification:', error);
        return false;
    }
};

// Combined Notification Functions
export const notifyNewMessage = async (recipientId, message, sender) => {
    try {
        // Create in-app notification
        await createInAppNotification({
            recipientId: recipientId,
            senderId: sender.id,
            type: 'message',
            title: 'New Message',
            content: message.message_type === 'text' ? message.content : '📷 Image',
            additionalData: {
                conversationId: message.conversation_id,
                messageId: message.id
            }
        });

        // Send push notification
        await sendPushNotification(recipientId, {
            type: 'messages',
            title: `New message from ${sender.username}`,
            body: message.message_type === 'text' ? message.content : '📷 Image',
            icon: sender.avatar_url,
            data: {
                type: 'message',
                conversationId: message.conversation_id,
                messageId: message.id
            }
        });
    } catch (error) {
        console.error('Error sending message notifications:', error);
    }
};

export const notifyNewMatch = async (userId, matchedUser, matchData) => {
    try {
        // Create in-app notification
        await createInAppNotification({
            recipientId: userId,
            senderId: matchedUser.id,
            type: 'match',
            title: 'New Match!',
            content: `You matched with ${matchedUser.username}!`,
            additionalData: {
                matchId: matchData.id
            }
        });

        // Send push notification
        await sendPushNotification(userId, {
            type: 'matches',
            title: 'New Match! 🎉',
            body: `You matched with ${matchedUser.username}`,
            icon: matchedUser.avatar_url,
            data: {
                type: 'match',
                matchId: matchData.id
            }
        });
    } catch (error) {
        console.error('Error sending match notifications:', error);
    }
};

export const notifyNewLike = async (userId, likedByUser) => {
    try {
        await createInAppNotification({
            recipientId: userId,
            senderId: likedByUser.id,
            type: 'like',
            title: 'New Like',
            content: `${likedByUser.username} liked your profile!`,
            additionalData: {
                userId: likedByUser.id
            }
        });
    } catch (error) {
        console.error('Error sending like notification:', error);
    }
};

export const notifySystemMessage = async (userId, title, message, data = {}) => {
    try {
        // Create in-app notification
        await createInAppNotification({
            recipientId: userId,
            senderId: null,
            type: 'system',
            title,
            content: message,
            additionalData: data
        });

        // Send push notification
        await sendPushNotification(userId, {
            type: 'system',
            title,
            body: message,
            icon: '/app-icon.png',
            data: {
                type: 'system',
                ...data
            }
        });
    } catch (error) {
        console.error('Error sending system notifications:', error);
    }
};

// Utility Functions
export const removeExpiredSubscriptions = async (userId) => {
    try {
        const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(
                    sub.subscription,
                    JSON.stringify({ type: 'ping' })
                );
            } catch (error) {
                if (error.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id);
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up subscriptions:', error);
    }
};
