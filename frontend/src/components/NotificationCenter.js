import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Bell, 
    Video, 
    MessageCircle, 
    Coins, 
    X,
    Settings 
} from 'lucide-react';
import NotificationService from '../services/NotificationService';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        video_calls: true,
        messages: true,
        low_balance: true
    });

    useEffect(() => {
        fetchNotifications();
        setupNotificationListener();
        loadSettings();
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        const hasPermission = await NotificationService.requestPermission();
        if (hasPermission) {
            await NotificationService.registerPushSubscription(
                supabase.auth.user().id
            );
        }
    };

    const loadSettings = async () => {
        const { data } = await supabase
            .from('notification_settings')
            .select('*')
            .single();
        
        if (data) {
            setSettings(data);
        }
    };

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
    };

    const setupNotificationListener = () => {
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${supabase.auth.user().id}`
            }, payload => {
                handleNewNotification(payload.new);
            })
            .subscribe();

        return () => subscription.unsubscribe();
    };

    const handleNewNotification = async (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Send local notification if enabled
        if (settings[notification.type]) {
            await NotificationService.sendLocalNotification(
                notification.title,
                { body: notification.body }
            );
        }
    };

    const markAsRead = async (notificationId) => {
        await NotificationService.markAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => prev - 1);
    };

    const updateSettings = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await NotificationService.updateNotificationSettings(newSettings);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'video_call':
                return <Video className="w-5 h-5 text-blue-500" />;
            case 'message':
                return <MessageCircle className="w-5 h-5 text-green-500" />;
            case 'low_balance':
                return <Coins className="w-5 h-5 text-yellow-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto z-50">
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <CardContent className="divide-y">
                        {/* Settings Section */}
                        <div className="py-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Notification Settings
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between">
                                    <span>Video Calls</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.video_calls}
                                        onChange={(e) => updateSettings('video_calls', e.target.checked)}
                                        className="rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Messages</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.messages}
                                        onChange={(e) => updateSettings('messages', e.target.checked)}
                                        className="rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span>Low Balance Alerts</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.low_balance}
                                        onChange={(e) => updateSettings('low_balance', e.target.checked)}
                                        className="rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Notifications List */}
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-3">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1">
                                        <p className="font-medium">{notification.title}</p>
                                        <p className="text-sm text-gray-600">{notification.body}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {notifications.length === 0 && (
                            <div className="p-4 text-center text-gray-500">
                                No notifications yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default NotificationCenter;
