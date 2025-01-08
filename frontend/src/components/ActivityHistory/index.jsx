// src/components/ActivityHistory/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MessageCircle, 
  Video, 
  Heart, 
  Star,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Search,
  ChevronDown
} from 'lucide-react';

export function ActivityHistory({ userId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const activityTypes = {
    message: {
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    videocall: {
      icon: Video,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    like: {
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
    review: {
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    payment: {
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    booking: {
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    }
  };

  const timeRanges = [
    { value: '7d', label: 'Ultima săptămână' },
    { value: '30d', label: 'Ultima lună' },
    { value: '90d', label: 'Ultimele 3 luni' },
    { value: '1y', label: 'Ultimul an' }
  ];

  useEffect(() => {
    loadActivities();
  }, [userId, filter, timeRange]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci activitățile de la server
      const mockActivities = [
        {
          id: 1,
          type: 'message',
          title: 'Conversație cu Ana M.',
          description: 'Ai trimis 5 mesaje',
          timestamp: new Date(),
          metadata: {
            messageCount: 5,
            duration: '15 minute'
          }
        },
        {
          id: 2,
          type: 'videocall',
          title: 'Apel video cu Maria D.',
          description: 'Durata: 30 minute',
          timestamp: new Date(Date.now() - 3600000),
          metadata: {
            duration: '30 minute',
            cost: '150 TC'
          }
        }
        // ... mai multe activități
      ];

      setActivities(mockActivities);
    } catch (error) {
      setError('Eroare la încărcarea activităților');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Aici ar trebui să exporți activitățile într-un format specific (CSV, PDF, etc.)
      const response = await fetch(
        `/api/activities/export?timeRange=${timeRange}&filter=${filter}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Eroare la exportul activităților');
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (searchTerm) {
      return (
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      return activity.type === filter;
    }

    return true;
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Istoric Activitate</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          Exportă
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută în activități..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toate</option>
          {Object.entries(activityTypes).map(([type, data]) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {timeRanges.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de activități */}
      <div className="space-y-4">
        {filteredActivities.map(activity => {
          const ActivityIcon = activityTypes[activity.type].icon;

          return (
            <div
              key={activity.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${activityTypes[activity.type].bgColor}`}>
                  <ActivityIcon 
                    className={activityTypes[activity.type].color}
                    size={20}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-gray-600">{activity.description}</p>
                  
                  {activity.metadata && (
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      {activity.metadata.duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{activity.metadata.duration}</span>
                        </div>
                      )}
                      {activity.metadata.cost && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          <span>{activity.metadata.cost}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nu există activități pentru perioada selectată
          </div>
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

export default ActivityHistory;