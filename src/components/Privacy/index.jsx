// src/components/Privacy/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  Globe, 
  Shield, 
  Users, 
  UserX,
  Search,
  BellOff,
  MapPin,
  Save,
  AlertTriangle 
} from 'lucide-react';

export function Privacy({ userId }) {
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, private, contacts
    searchable: true,
    showOnline: true,
    showLocation: true,
    showActivity: true,
    allowMessages: 'all', // all, contacts, verified
    allowVideoCall: 'verified',
    blockList: []
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrivacySettings();
  }, [userId]);

  const loadPrivacySettings = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci setările de la server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulare delay
      
      // Simulăm încărcarea listei de utilizatori blocați
      setBlockedUsers([
        {
          id: '1',
          name: 'John Doe',
          avatar: '/profiles/1.jpg',
          blockedAt: new Date('2024-01-15'),
          reason: 'Spam'
        }
        // ... mai mulți utilizatori blocați
      ]);
      
      setIsLoading(false);
    } catch (error) {
      setError('Eroare la încărcarea setărilor');
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
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

  const handleUnblockUser = async (userId) => {
    try {
      // Aici ar trebui să deblochezi utilizatorul pe server
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      setError('Eroare la deblocarea utilizatorului');
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
      <h1 className="text-2xl font-bold mb-6">Setări de Confidențialitate</h1>

      {/* Vizibilitate Profil */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Eye size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Vizibilitate Profil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cine poate vedea profilul meu?
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                profileVisibility: e.target.value
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Toată lumea</option>
              <option value="contacts">Doar contactele</option>
              <option value="private">Privat</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Permite căutarea profilului</h3>
              <p className="text-sm text-gray-500">
                Profilul tău poate fi găsit în rezultatele căutării
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                searchable: !settings.searchable
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.searchable ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.searchable ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Arată status online</h3>
              <p className="text-sm text-gray-500">
                Permite altora să vadă când ești activ
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                showOnline: !settings.showOnline
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.showOnline ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.showOnline ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Setări Mesaje */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Setări Mesaje</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cine îmi poate trimite mesaje?
            </label>
            <select
              value={settings.allowMessages}
              onChange={(e) => setSettings({
                ...settings,
                allowMessages: e.target.value
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toată lumea</option>
              <option value="contacts">Doar contactele</option>
              <option value="verified">Doar utilizatori verificați</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cine poate iniția apeluri video?
            </label>
            <select
              value={settings.allowVideoCall}
              onChange={(e) => setSettings({
                ...settings,
                allowVideoCall: e.target.value
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toată lumea</option>
              <option value="contacts">Doar contactele</option>
              <option value="verified">Doar utilizatori verificați</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listă Utilizatori Blocați */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <UserX size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold">Utilizatori Blocați</h2>
          </div>
          <button
            onClick={() => setShowBlockList(!showBlockList)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showBlockList ? 'Ascunde' : 'Arată'} ({blockedUsers.length})
          </button>
        </div>

        {showBlockList && (
          <div className="space-y-4">
            {blockedUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nu ai blocat niciun utilizator
              </p>
            ) : (
              blockedUsers.map(user => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">
                        Blocat pe {new Date(user.blockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(user.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Deblochează
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
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

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Privacy;