import { supabase } from '../config/supabase';

class NotificationService {
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    async registerPushSubscription(userId) {
        try {
            if (!('serviceWorker' in navigator)) return;

            const registration = await navigator.serviceWorker.register('/service-worker.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
            });

            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: userId,
                    subscription: JSON.stringify(subscription),
                    created_at: new Date()
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error registering push subscription:', error);
            return false;
        }
    }

    async updateNotificationSettings(settings) {
        try {
            const { error } = await supabase
                .from('notification_settings')
                .upsert({
                    user_id: supabase.auth.user().id,
                    ...settings,
                    updated_at: new Date()
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            return false;
        }
    }

    async sendLocalNotification(title, options = {}) {
        if (!('Notification' in window)) return;

        try {
            if (Notification.permission === 'granted') {
                return new Notification(title, {
                    icon: '/app-icon.png',
                    ...options
                });
            }
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    }

    async markAsRead(notificationId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({
                    read: true,
                    read_at: new Date()
                })
                .eq('id', notificationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
}

export default new NotificationService();
