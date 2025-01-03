// src/components/ProviderCalendar/index.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, Save, Trash } from 'lucide-react';
import { getProviderAvailability, updateProviderServices } from '../../services/bookingService';

export function ProviderCalendar({ providerId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });
  const [error, setError] = useState(null);

  const HOURS = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );

  useEffect(() => {
    loadAvailability();
  }, [selectedDate, providerId]);

  const loadAvailability = async () => {
    try {
      const response = await getProviderAvailability(providerId, selectedDate.toISOString());
      if (response.success) {
        setTimeSlots(response.data.slots || []);
      }
    } catch (error) {
      setError('Eroare la încărcarea disponibilității');
    }
  };

  const handleSaveSlot = async () => {
    if (!newSlot.start || !newSlot.end) {
      setError('Selectați ora de început și de sfârșit');
      return;
    }

    const start = new Date(`${selectedDate.toDateString()} ${newSlot.start}`);
    const end = new Date(`${selectedDate.toDateString()} ${newSlot.end}`);

    if (end <= start) {
      setError('Ora de sfârșit trebuie să fie după ora de început');
      return;
    }

    // Verifică suprapunerea cu alte sloturi
    const hasOverlap = timeSlots.some(slot => {
      const slotStart = new Date(`${selectedDate.toDateString()} ${slot.start}`);
      const slotEnd = new Date(`${selectedDate.toDateString()} ${slot.end}`);
      return (start < slotEnd && end > slotStart);
    });

    if (hasOverlap) {
      setError('Acest interval se suprapune cu alt slot existent');
      return;
    }

    setTimeSlots([...timeSlots, newSlot]);
    setNewSlot({ start: '', end: '' });
    setIsEditing(false);
    setError(null);

    try {
      await updateProviderServices(providerId, {
        date: selectedDate.toISOString(),
        slots: [...timeSlots, newSlot]
      });
    } catch (error) {
      setError('Eroare la salvarea disponibilității');
    }
  };

  const handleDeleteSlot = async (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);

    try {
      await updateProviderServices(providerId, {
        date: selectedDate.toISOString(),
        slots: updatedSlots
      });
    } catch (error) {
      setError('Eroare la ștergerea slotului');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Program Disponibilitate</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={isEditing}
        >
          <Plus size={20} />
          Adaugă Slot
        </button>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <CalendarIcon size={24} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
        {timeSlots.map((slot, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-gray-400" />
              <span>
                {slot.start} - {slot.end}
              </span>
            </div>
            <button
              onClick={() => handleDeleteSlot(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            >
              <Trash size={20} />
            </button>
          </div>
        ))}

        {/* Add New Slot Form */}
        {isEditing && (
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Ora început</label>
                <select
                  value={newSlot.start}
                  onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează ora</option>
                  {HOURS.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Ora sfârșit</label>
                <select
                  value={newSlot.end}
                  onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează ora</option>
                  {HOURS.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewSlot({ start: '', end: '' });
                  setError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSaveSlot}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={20} />
                Salvează
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProviderCalendar;