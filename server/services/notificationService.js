const { supabase } = require('../config/supabase');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

class NotificationService {
    async createNotification(userId, type, content, metadata = {}) {
        try {
            // Inserare notificare în baza de date
            const { data: notification, error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type,
                    content,
                    metadata,
                    created_at: new Date()
                })
                .single();

            if (error) throw error;

            // Verificare setări notificări Telegram
            const { data: settings } = await supabase
                .from('telegram_notification_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            // Trimitere notificare Telegram dacă este activată
            if (settings && settings[type] === true) {
                await this.sendTelegramNotification(userId, content);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async sendTelegramNotification(userId, content) {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('telegram_id')
                .eq('user_id', userId)
                .single();

            if (profile?.telegram_id) {
                await bot.sendMessage(profile.telegram_id, content, {
                    parse_mode: 'HTML'
                });
            }
        } catch (error) {
            console.error('Error sending Telegram notification:', error);
            // Nu aruncăm eroarea pentru a nu întrerupe fluxul principal
        }
    }

    async getUnreadNotifications(userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('read', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true, read_at: new Date() })
                .match({ id: notificationId, user_id: userId });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async updateNotificationSettings(userId, settings) {
        try {
            const { error } = await supabase
                .from('telegram_notification_settings')
                .upsert({
                    user_id: userId,
                    ...settings,
                    updated_at: new Date()
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
