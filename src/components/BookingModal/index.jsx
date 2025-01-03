// src/components/BookingModal/index.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import { SERVICE_TYPES } from '../../services/bookingService';
import { createBooking, getProviderAvailability } from '../../services/bookingService';
import { transferCoins } from '../../services/walletService';

export function BookingModal({ isOpen, onClose, provider, userId, userBalance }) {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: 60,
    serviceType: '',
    location: '',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && provider) {
      loadAvailability();
    }
  }, [isOpen, provider]);

  const loadAvailability = async () => {
    if (!bookingData.date) return;
    
    try {
      const response = await getProviderAvailability(provider.id, bookingData.date);
      if (response.success) {
        setAvailableSlots(response.data);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const calculateTotal = () => {
    if (!bookingData.serviceType || !bookingData.duration) return 0;
    const ratePerHour = provider.rates[bookingData.serviceType] || 0;
    return (ratePerHour * bookingData.duration) / 60;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const total = calculateTotal();
      if (total > userBalance) {
        throw new Error('Sold insuficient');
      }

      // Creează rezervarea
      const bookingResponse = await createBooking({
        ...bookingData,
        providerId: provider.id,
        userId,
        total
      });

      if (bookingResponse.success) {
        // Transferă TerriCoins
        await transferCoins(userId, provider.id, total, 'booking');
        onClose();
      } else {
        throw new Error(bookingResponse.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Rezervare Serviciu</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tip Serviciu */}
          <div>
            <label className="block text-sm font-medium mb-1">Tip Serviciu</label>
            <select
              value={bookingData.serviceType}
              onChange={e => setBookingData({...bookingData, serviceType: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selectează serviciul</option>
              {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={bookingData.date}
                onChange={e => {
                  setBookingData({...bookingData, date: e.target.value});
                  loadAvailability();
                }}
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Ora */}
          <div>
            <label className="block text-sm font-medium mb-1">Ora</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={bookingData.time}
                onChange={e => setBookingData({...bookingData, time: e.target.value})}
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selectează ora</option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Durată */}
          <div>
            <label className="block text-sm font-medium mb-1">Durată (minute)</label>
            <select
              value={bookingData.duration}
              onChange={e => setBookingData({...bookingData, duration: Number(e.target.value)})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="30">30 minute</option>
              <option value="60">1 oră</option>
              <option value="90">1.5 ore</option>
              <option value="120">2 ore</option>
            </select>
          </div>

          {/* Locație */}
          <div>
            <label className="block text-sm font-medium mb-1">Locație</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={bookingData.location}
                onChange={e => setBookingData({...bookingData, location: e.target.value})}
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Adresa întâlnirii"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">Note adiționale</label>
            <textarea
              value={bookingData.notes}
              onChange={e => setBookingData({...bookingData, notes: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Cerințe sau preferințe speciale..."
            />
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <div className="flex items-center gap-1">
                <DollarSign size={20} className="text-green-600" />
                <span className="text-xl font-bold">{calculateTotal()} TC</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Se procesează...' : 'Confirmă Rezervarea'}
          </button>
        </form>
      </div>
    </div>
  );
}