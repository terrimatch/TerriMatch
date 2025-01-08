// src/components/PushNotifications/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  SmartphoneNfc, 
  Globe,
  MessageCircle,
  Heart,
  Calendar,
  DollarSign,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

export function PushNotifications({ userId }) {
  const [settings, setSettings] = useState({
    enabled: false,
    subscription: null,
    preferences: {
      messages: true,
      matches: true,
      bookings: true,
      payments: true,
      system: true
    },
    schedule: {
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      quiet_hours_enabled: false
    },
    devices: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotificationSettings();
    checkPermission();
  }, [userId]);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci setările de la server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      setIsLoading(false);
    } catch (error) {
      setError('Eroare la încărcarea setărilor');
      setIsLoading(false);
    }
  };

  const checkPermission = async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Browserul nu suportă notificări push');
      }

      const permission = await Notification.requestPermission();
      setSettings(prev => ({
        ...prev,
        enabled: permission === 'granted'
      }));
    } catch (error) {
      setError('Eroare la verificarea permisiunilor');
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // Verifică dacă serviciul de notificări este disponibil
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker nu este suportat');
      }

      // Înregistrează Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Obține subscripția push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
      });

      // Trimite subscripția la server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription
        }),
      });

      setSettings(prev => ({
        ...prev,
        enabled: true,
        subscription
      }));
    } catch (error) {
      setError('Eroare la activarea notificărilor');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // Dezactivează subscripția
      if (settings.subscription) {
        await settings.subscription.unsubscribe();
      }

      // Notifică serverul
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      setSettings(prev => ({
        ...prev,
        enabled: false,
        subscription: null
      }));
    } catch (error) {
      setError('Eroare la dezactivarea notificărilor');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      // Aici ar trebui să salvezi preferințele pe server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      setIsSaving(false);
    } catch (error) {
      setError('Eroare la salvarea preferințelor');
      setIsSaving(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    try {
      // Aici ar trebui să ștergi dispozitivul de pe server
      setSettings(prev => ({
        ...prev,
        devices: prev.devices.filter(d => d.id !== deviceId)
      }));
    } catch (error) {
      setError('Eroare la ștergerea dispozitivului');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Setări Notificări Push</h1>

      {/* Status Notificări */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="text-green-500" size={24} />
            ) : (
              <BellOff className="text-gray-400" size={24} />
            )}
            <div>
              <h2 className="font-semibold">Notificări Push</h2>
              <p className="text-sm text-gray-500">
                {settings.enabled 
                  ? 'Notificările sunt activate' 
                  : 'Notificările sunt dezactivate'}
              </p>
            </div>
          </div>

          <button
            onClick={settings.enabled ? handleUnsubscribe : handleSubscribe}
            disabled={isSubscribing}
            className={`px-4 py-2 rounded-lg ${
              isSubscribing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : settings.enabled
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isSubscribing 
              ? 'Se procesează...'
              : settings.enabled 
                ? 'Dezactivează' 
                : 'Activează'}
          </button>
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Preferințe Notificări */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Preferințe Notificări</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="text-blue-500" size={20} />
                  <div>
                    <h3 className="font-medium">Mesaje Noi</h3>
                    <p className="text-sm text-gray-500">
                      Primește notificări pentru mesaje noi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      messages: !prev.preferences.messages
                    }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.preferences.messages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.messages ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="text-pink-500" size={20} />
                  <div>
                    <h3 className="font-medium">Match-uri Noi</h3>
                    <p className="text-sm text-gray-500">
                      Primește notificări pentru match-uri noi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      matches: !prev.preferences.matches
                    }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.preferences.matches ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.preferences.matches ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>

              {/* Alte preferințe similare */}
            </div>
          </div>

          {/* Program Notificări */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Program Notificări</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ore de liniște</h3>
                  <p className="text-sm text-gray-500">
                    Nu primi notificări în intervalul specificat
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      quiet_hours_enabled: !prev.schedule.quiet_hours_enabled
                    }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.schedule.quiet_hours_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.schedule.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>

              {settings.schedule.quiet_hours_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Început
                    </label>
                    <input
                      type="time"
                      value={settings.schedule.quiet_hours_start}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          quiet_hours_start: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sfârșit
                    </label>
                    <input
                      type="time"
                      value={settings.schedule.quiet_hours_end}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          quiet_hours_end: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dispozitive Înregistrate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dispozitive Înregistrate</h2>

            <div className="space-y-4">
              {settings.devices.map(device => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <SmartphoneNfc className="text-gray-400" size={20} />
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-sm text-gray-500">
                        Ultima activitate: {new Date(device.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <BellOff size={20} />
                  </button>
                </div>
              ))}

              {settings.devices.length === 0 && (
                <p className="text-center text-gray-500">
                  Nu există dispozitive înregistrate
                </p>
              )}
            </div>
          </div>

          {/* Butoane Acțiuni */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isSaving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              <span>{isSaving ? 'Se salvează...' : 'Salvează Setările'}</span>
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default PushNotifications;