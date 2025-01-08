// src/components/ProviderProfile/index.jsx
import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Star, Heart, MessageCircle, Video, Flag, Share2, DollarSign } from 'lucide-react';
import { getProfile, updateProfile } from '../../services/profileService';
import { Reviews } from '../Reviews';
import { ProviderCalendar } from '../ProviderCalendar';

export function ProviderProfile({ providerId, currentUserId, onBooking }) {
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviderProfile();
  }, [providerId]);

  const loadProviderProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getProfile(providerId);
      if (response.success) {
        setProvider(response.data);
        setEditedProfile(response.data);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Eroare la încărcarea profilului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await updateProfile(providerId, editedProfile);
      if (response.success) {
        setProvider(response.data);
        setIsEditing(false);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Eroare la actualizarea profilului');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!provider) return null;

  const tabs = [
    { id: 'about', label: 'Despre' },
    { id: 'services', label: 'Servicii' },
    { id: 'reviews', label: 'Review-uri' },
    { id: 'calendar', label: 'Program' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header/Cover */}
      <div className="relative h-64 bg-gray-200 rounded-t-lg overflow-hidden">
        <img
          src={provider.coverImage || '/default-cover.jpg'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {providerId === currentUserId && (
          <button className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white shadow rounded-b-lg">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="relative -mt-20">
                <img
                  src={provider.profileImage || '/default-avatar.jpg'}
                  alt={provider.name}
                  className="w-32 h-32 rounded-lg border-4 border-white shadow-lg"
                />
                {providerId === currentUserId && (
                  <button className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100">
                    <Camera size={16} />
                  </button>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={18} />
                    <span>{provider.rating} ({provider.reviewCount} review-uri)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={18} />
                    <span>Membru din {new Date(provider.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {providerId !== currentUserId ? (
                <>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Favorite">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Mesaj">
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-full" 
                    title="Video Call"
                    onClick={onBooking}
                  >
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full" title="Distribuie">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full" title="Raportează">
                    <Flag size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg ${
                    isEditing ? 'bg-gray-200' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isEditing ? 'Anulează' : 'Editează Profil'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b mt-6">
            <div className="flex gap-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Descriere</label>
                    <textarea
                      value={editedProfile.description}
                      onChange={e => setEditedProfile({
                        ...editedProfile,
                        description: e.target.value
                      })}
                      rows="4"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Locație</label>
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={e => setEditedProfile({
                        ...editedProfile,
                        location: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact</label>
                    <input
                      type="text"
                      value={editedProfile.contact}
                      onChange={e => setEditedProfile({
                        ...editedProfile,
                        contact: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Salvează Modificările
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700">{provider.description}</p>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Program</h3>
                      <div className="space-y-1 text-gray-600">
                        {provider.schedule?.map((day, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{day.day}:</span>
                            <span>{day.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Contact</h3>
                      <div className="space-y-2 text-gray-600">
                        <p>{provider.contact}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              {provider.services?.map((service, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign size={18} />
                      <span className="font-semibold">{service.price} TC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <Reviews providerId={providerId} currentUserId={currentUserId} />
          )}

          {activeTab === 'calendar' && (
            <ProviderCalendar providerId={providerId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderProfile;