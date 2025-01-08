// src/components/Notifications/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Star,
  Clock,
  Trash,
  Settings 
} from 'lucide-react';

export function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sound: true,
    categories: {
      messages: true,
      matches: true,
      bookings: true,
      system: true
    }
  });
  const [error, setError] = useState(null);

  const notificationTypes = {
    message: {
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    match: {
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
    booking: {
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    review: {
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    alert: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId, filter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci notificările de la server
      // Pentru exemplu folosim date statice
      const mockNotifications = [
        {
          id: 1,
          type: 'message',
          title: 'Mesaj nou',
          message: 'Ai primit un mesaj nou de la Ana M.',
          timestamp: new Date(),
          read: false
        },
        {
          id: 2,
          type: 'booking',
          title: 'Rezervare confirmată',
          message: 'Rezervarea ta pentru mâine a fost confirmată',
          timestamp: new Date(Date.now() - 3600000),
          read: true
        },
        // ... mai multe notificări
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      setError('Eroare la încărcarea notificărilor');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Aici ar trebui să marchezi notificarea ca citită pe server
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      setError('Eroare la marcarea notificării');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Aici ar trebui să ștergi notificarea pe server
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      setError('Eroare la ștergerea notificării');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Aici ar trebui să marchezi toate notificările ca citite pe server
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      setError('Eroare la marcarea notificărilor');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      // Aici ar trebui să actualizezi setările pe server
      setSettings(newSettings);
    } catch (error) {
      setError('Eroare la actualizarea setărilor');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notificări</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Marchează toate ca citite
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Toate
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Necitite
        </button>
        {Object.keys(notificationTypes).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de notificări */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nu există notificări
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const NotificationIcon = notificationTypes[notification.type].icon;
            
            return (
              <div
                key={notification.id}
                className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${notificationTypes[notification.type].bgColor}`}>
                    <NotificationIcon 
                      className={notificationTypes[notification.type].color}
                      size={20}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-gray-600">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Notifications;