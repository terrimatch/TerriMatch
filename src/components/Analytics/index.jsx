// src/components/Analytics/index.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Star, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { getUserStats, EVENT_TYPES } from '../../services/analyticsService';

export function Analytics({ userId, userType }) {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('earnings');

  useEffect(() => {
    loadStats();
  }, [userId, timeRange]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getUserStats(userId, timeRange);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    {
      id: 'earnings',
      label: 'Câștiguri',
      icon: DollarSign,
      color: '#10B981',
      format: (value) => `${value} TC`
    },
    {
      id: 'clients',
      label: 'Clienți Noi',
      icon: Users,
      color: '#3B82F6',
      format: (value) => value
    },
    {
      id: 'rating',
      label: 'Rating Mediu',
      icon: Star,
      color: '#F59E0B',
      format: (value) => value.toFixed(1)
    },
    {
      id: 'hours',
      label: 'Ore Lucrate',
      icon: Clock,
      color: '#8B5CF6',
      format: (value) => `${value}h`
    }
  ];

  const timeRanges = [
    { value: '7d', label: 'Ultima săptămână' },
    { value: '30d', label: 'Ultima lună' },
    { value: '90d', label: 'Ultimele 3 luni' },
    { value: '1y', label: 'Ultimul an' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header cu selectare perioadă */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistici și Analiză</h2>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="pl-4 pr-10 py-2 bg-white border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Carduri cu metrici principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => (
          <div 
            key={metric.id}
            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
              activeMetric === metric.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveMetric(metric.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${metric.color}20` }}>
                <metric.icon size={24} style={{ color: metric.color }} />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp 
                  size={16} 
                  className={stats[metric.id].trend >= 0 ? 'text-green-500' : 'text-red-500'}
                />
                <span className={stats[metric.id].trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(stats[metric.id].trend)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-gray-500 text-sm">{metric.label}</h3>
              <p className="text-2xl font-bold">
                {metric.format(stats[metric.id].current)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafic principal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Evoluție în timp</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats[activeMetric].history}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={metrics.find(m => m.id === activeMetric).color} 
                    stopOpacity={0.1}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={metrics.find(m => m.id === activeMetric).color} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metrics.find(m => m.id === activeMetric).color}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistici detaliate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Servicii */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Servicii</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuție clienți */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribuție Clienți</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.clientDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {stats.clientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Listă cu activitate recentă */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Activitate Recentă</h3>
        <div className="space-y-4">
          {stats.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
              {activity.value && (
                <div className="font-medium">
                  {activity.type === EVENT_TYPES.PAYMENT_MADE ? `${activity.value} TC` : activity.value}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const getActivityColor = (type) => {
  switch (type) {
    case EVENT_TYPES.PAYMENT_MADE:
      return 'bg-green-100 text-green-600';
    case EVENT_TYPES.SERVICE_COMPLETED:
      return 'bg-blue-100 text-blue-600';
    case EVENT_TYPES.VIDEO_CALL:
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case EVENT_TYPES.PAYMENT_MADE:
      return <DollarSign size={20} />;
    case EVENT_TYPES.SERVICE_COMPLETED:
      return <CheckCircle size={20} />;
    case EVENT_TYPES.VIDEO_CALL:
      return <Video size={20} />;
    default:
      return <Activity size={20} />;
  }
};

export default Analytics;