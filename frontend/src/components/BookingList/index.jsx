// src/components/BookingList/index.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle, Filter, Search, Star } from 'lucide-react';
import { getBookingHistory, updateBookingStatus, BOOKING_STATUS } from '../../services/bookingService';
import { getProviderServices } from '../../services/bookingService';

const statusColors = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800'
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + ' ani';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' luni';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' zile';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' ore';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minute';
  return Math.floor(seconds) + ' secunde';
};

export function BookingList({ userId, role = 'client', onBookingUpdate }) {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadBookings();
    if (role === 'provider') {
      loadServices();
    }
  }, [userId, role]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await getBookingHistory(userId, role);
      if (response.success) {
        setBookings(response.data);
        setFilteredBookings(response.data);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Eroare la încărcarea rezervărilor');
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await getProviderServices(userId);
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
        if (onBookingUpdate) {
          onBookingUpdate(bookingId, newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  useEffect(() => {
    let result = bookings;

    // Aplicare filtru status
    if (filter !== 'all') {
      result = result.filter(booking => booking.status === filter);
    }

    // Aplicare căutare
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.serviceType.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query) ||
        (role === 'client' ? 
          booking.provider.name.toLowerCase().includes(query) :
          booking.client.name.toLowerCase().includes(query))
      );
    }

    // Sortare
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'price':
          return b.total - a.total;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    setFilteredBookings(result);
  }, [bookings, filter, searchQuery, sortBy]);

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

  return (
    <div className="space-y-4">
      {/* Bară de căutare și filtre */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută după nume, serviciu sau locație..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="date">Dată</option>
              <option value="price">Preț</option>
              <option value="duration">Durată</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Toate
          </button>
          {Object.values(BOOKING_STATUS).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de rezervări */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg">
            <p className="text-gray-500">Nu există rezervări</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {role === 'client' ? booking.provider.name : booking.client.name}
                    {booking.provider.rating && (
                      <span className="flex items-center text-sm text-yellow-500">
                        <Star size={16} className="fill-current" />
                        {booking.provider.rating}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">{booking.serviceType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[booking.status]}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>{booking.time} ({booking.duration} min)</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span>{booking.location}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={18} />
                  <span>{booking.total} TC</span>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Creat {timeAgo(booking.createdAt)} în urmă</span>
                
                {booking.status === BOOKING_STATUS.PENDING && role === 'provider' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, BOOKING_STATUS.CONFIRMED)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle size={18} />
                      Acceptă
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, BOOKING_STATUS.CANCELLED)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle size={18} />
                      Refuză
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookingList;