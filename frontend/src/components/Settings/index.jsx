// src/components/Settings/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Lock, 
  CreditCard, 
  User, 
  Globe, 
  Moon, 
  Sun, 
  Shield, 
  Trash,
  Toggle,
  Save
} from 'lucide-react';

export function Settings({ userId }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      visibility: 'public',
      showOnline: true,
      allowMessages: true,
      allowVideoCalls: true,
    },
    notifications: {
      messages: true,
      matches: true,
      bookings: true,
      marketing: false,
      email: true,
      push: true
    },
    privacy: {
      twoFactorAuth: false,
      showActivity: true,
      showLocation: true,
      blockList: []
    },
    appearance: {
      theme: 'light',
      language: 'ro',
      timeFormat: '24h'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notificări', icon: Bell },
    { id: 'privacy', label: 'Confidențialitate', icon: Lock },
    { id: 'appearance', label: 'Aspect', icon: Moon },
    { id: 'payment', label: 'Plăți', icon: CreditCard },
    { id: 'security', label: 'Securitate', icon: Shield }
  ];

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci setările de la server
      // Pentru exemplu folosim datele statice din state
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      setIsLoading(false);
    } catch (error) {
      setError('Eroare la încărcarea setărilor');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Aici ar trebui să salvezi setările pe server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      setIsSaving(false);
    } catch (error) {
      setError('Eroare la salvarea setărilor');
      setIsSaving(false);
    }
  };

  const handleToggleSetting = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleChangeValue = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-6">
        {/* Sidebar cu tabs */}
        <div className="w-64">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conținut principal */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Setări Profil</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vizibilitate Profil
                    </label>
                    <select
                      value={settings.profile.visibility}
                      onChange={(e) => handleChangeValue('profile', 'visibility', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Privat</option>
                      <option value="contacts">Doar Contacte</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Arată status online</h3>
                      <p className="text-sm text-gray-500">
                        Permite altora să vadă când ești activ
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('profile', 'showOnline')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.profile.showOnline ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.profile.showOnline ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Permite mesaje</h3>
                      <p className="text-sm text-gray-500">
                        Primește mesaje de la alți utilizatori
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('profile', 'allowMessages')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.profile.allowMessages ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.profile.allowMessages ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Setări Notificări</h2>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <p className="text-sm text-gray-500">
                          Primește notificări pentru {key}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('notifications', key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`} 
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Setări Confidențialitate</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Autentificare în doi pași</h3>
                      <p className="text-sm text-gray-500">
                        Adaugă un nivel extra de securitate
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('privacy', 'twoFactorAuth')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.privacy.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Arată activitate</h3>
                      <p className="text-sm text-gray-500">
                        Permite altora să vadă când ești activ
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('privacy', 'showActivity')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.privacy.showActivity ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Setări Aspect</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Temă
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChangeValue('appearance', 'theme', 'light')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          settings.appearance.theme === 'light'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Sun size={20} />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => handleChangeValue('appearance', 'theme', 'dark')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          settings.appearance.theme === 'dark'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Moon size={20} />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Limbă
                    </label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => handleChangeValue('appearance', 'language', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ro">Română</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;