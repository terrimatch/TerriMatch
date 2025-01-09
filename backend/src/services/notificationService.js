import webpush from 'web-push';
import { supabase } from '../config/supabaseClient.js';

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

export const notifyNewMessage = async (userId, message, sender) => {
    try {
        await sendPushNotification(userId, {
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
        console.error('Error sending message notification:', error);
    }
};

export const notifyNewMatch = async (userId, matchedUser) => {
    try {
        await sendPushNotification(userId, {
            type: 'matches',
            title: 'New Match! 🎉',
            body: `You matched with ${matchedUser.username}`,
            icon: matchedUser.avatar_url,
            data: {
                type: 'match',
                matchId: matchedUser.id
            }
        });
    } catch (error) {
        console.error('Error sending match notification:', error);
    }
};

export const notifySystemMessage = async (userId, title, message) => {
    try {
        await sendPushNotification(userId, {
            type: 'system',
            title,
            body: message,
            icon: '/app-icon.png',
            data: {
                type: 'system'
            }
        });
    } catch (error) {
        console.error('Error sending system notification:', error);
    }
};
