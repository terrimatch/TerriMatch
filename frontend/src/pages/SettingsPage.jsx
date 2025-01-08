import React, { useState } from 'react';
import { Camera, Save, Bell, Lock, CreditCard, HelpCircle, LogOut } from 'lucide-react';

export function SettingsPage({ user, onUpdate }) {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    description: user?.description || '',
    age: user?.age || '',
    location: user?.location || '',
    category: user?.category || '',
    availability: user?.availability || '',
    priceRange: user?.priceRange || '',
    notifications: true,
    profileVisibility: 'public'
  });

  const settingsSections = [
    {
      icon: Bell,
      title: 'Notificări',
      description: 'Gestionează notificările'
    },
    {
      icon: Lock,
      title: 'Confidențialitate',
      description: 'Setări de confidențialitate și vizibilitate'
    },
    {
      icon: CreditCard,
      title: 'Plăți și Facturare',
      description: 'Gestionează metode de plată'
    },
    {
      icon: HelpCircle,
      title: 'Ajutor',
      description: 'Întrebări frecvente și suport'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Setări Profil</h1>

      {/* Profil Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="relative">
            <img
              src={user?.image || "/profiles/default.jpg"}
              alt="Profile"
              className="w-32 h-32 rounded-lg object-cover"
            />
            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vârstă
                </label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={e => setProfileData({...profileData, age: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locație
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={e => setProfileData({...profileData, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={profileData.category}
                  onChange={e => setProfileData({...profileData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Utilizator Regular</option>
                  <option value="provider">Furnizor Servicii</option>
                </select>
              </div>
            </div>

            {profileData.category === 'provider' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program
                  </label>
                  <input
                    type="text"
                    value={profileData.availability}
                    onChange={e => setProfileData({...profileData, availability: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Luni-Vineri, 10:00-18:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preț/Oră (TC)
                  </label>
                  <input
                    type="number"
                    value={profileData.priceRange}
                    onChange={e => setProfileData({...profileData, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere
              </label>
              <textarea
                value={profileData.description}
                onChange={e => setProfileData({...profileData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alte Setări */}
      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <section.icon className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Butoane Acțiuni */}
      <div className="mt-8 flex justify-between">
        <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <LogOut size={20} />
            <span>Deconectare</span>
          </div>
        </button>

        <button 
          onClick={() => onUpdate(profileData)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Save size={20} />
            <span>Salvează Modificările</span>
          </div>
        </button>
      </div>
    </div>
  );
}