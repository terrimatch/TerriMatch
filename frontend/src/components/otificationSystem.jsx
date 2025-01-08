// src/components/NotificationSystem.jsx
import React, { useEffect } from 'react';
import { create } from 'zustand';
import { Bell } from 'lucide-react';

// Store pentru notificări
const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));

export function NotificationSystem() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  useEffect(() => {
    // Verifică permisiunile pentru notificări browser
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            notification.type === 'match' ? 'bg-pink-600' :
            'bg-blue-600'
          } text-white`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div className="flex-1">
              {notification.title && (
                <h4 className="font-semibold mb-1">{notification.title}</h4>
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook pentru folosirea notificărilor în aplicație
export function useNotifications() {
  const addNotification = useNotificationStore((state) => state.addNotification);

  const notify = (options) => {
    addNotification(options);

    // Arată și notificare browser dacă este permis și utilizatorul nu este activ
    if (
      Notification.permission === 'granted' &&
      document.visibilityState === 'hidden'
    ) {
      new Notification(options.title || 'TerriMatch', {
        body: options.message,
        icon: '/logo.png'
      });
    }
  };

  return { notify };
}

export default NotificationSystem;