// src/components/Analytics/AdvancedStats.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export function AdvancedStats({ userId, userType }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [error, setError] = useState(null);

  const metrics = [
    {
      id: 'revenue',
      label: 'Venituri',
      icon: DollarSign,
      color: '#10B981',
      format: (value) => `${value} TC`
    },
    {
      id: 'clients',
      label: 'Clienți',
      icon: Users,
      color: '#3B82F6',
      format: (value) => value
    },
    {
      id: 'bookings',
      label: 'Rezervări',
      icon: Calendar,
      color: '#8B5CF6',
      format: (value) => value
    },
    {
      id: 'hours',
      label: 'Ore Lucrate',
      icon: Clock,
      color: '#F59E0B',
      format: (value) => `${value}h`
    }
  ];

  const timeRanges = [
    { value: '7d', label: 'Ultimele 7 zile' },
    { value: '30d', label: 'Ultima lună' },
    { value: '90d', label: 'Ultimele 3 luni' },
    { value: '1y', label: 'Ultimul an' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange, comparisonPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Aici ar trebui să încarci datele reale de la server
      const mockData = {
        summary: {
          revenue: {
            current: 5000,
            previous: 4200,
            trend: 19.05
          },
          clients: {
            current: 150,
            previous: 120,
            trend: 25
          },
          bookings: {
            current: 45,
            previous: 40,
            trend: 12.5
          },
          hours: {
            current: 120,
            previous: 100,
            trend: 20
          }
        },
        charts: {
          revenue: {
            data: [
              { date: '2024-01-01', value: 500 },
              { date: '2024-01-02', value: 600 },
              // ... mai multe date
            ]
          },
          clientTypes: [
            { name: 'Noi', value: 30 },
            { name: 'Recurenți', value: 70 }
          ],
          serviceDistribution: [
            { name: 'Dating', value: 40 },
            { name: 'Escort', value: 35 },
            { name: 'Masaj', value: 25 }
          ],
          hourlyActivity: [
            { hour: '00:00', value: 5 },
            { hour: '01:00', value: 3 },
            // ... mai multe ore
          ]
        },
        topPerformers: [
          {
            id: '1',
            name: 'Ana M.',
            revenue: 2500,
            clients: 45,
            rating: 4.9
          }
          // ... mai mulți performeri
        ]
      };

      setData(mockData);
    } catch (error) {
      setError('Eroare la încărcarea datelor statistice');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleExportData = async () => {
    try {
      // Aici ar trebui să exporți datele statistice
      const response = await fetch(
        `/api/analytics/export?timeRange=${timeRange}&userId=${userId}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Eroare la exportul datelor');
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Statistici Avansate</h1>
        <div className="flex items-center gap-4">
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

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            Exportă Date
          </button>
        </div>
      </div>

      {/* Metrici Principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => {
          const metricData = data.summary[metric.id];
          const trend = calculateTrend(metricData.current, metricData.previous);

          return (
            <div
              key={metric.id}
              className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <metric.icon 
                    size={24} 
                    style={{ color: metric.color }} 
                  />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp 
                    size={16} 
                    className={trend >= 0 ? 'text-green-500' : 'text-red-500'} 
                  />
                  <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
              </div>

              <h3 className="text-gray-500">{metric.label}</h3>
              <p className="text-2xl font-bold mt-1">
                {metric.format(metricData.current)}
              </p>
              
              <p className="text-sm text-gray-500 mt-2">
                vs {metric.format(metricData.previous)} perioada anterioară
              </p>
            </div>
          );
        })}
      </div>

      {/* Grafic Principal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">
          Evoluție {metrics.find(m => m.id === selectedMetric)?.label}
        </h2>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts[selectedMetric].data}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={metrics.find(m => m.id === selectedMetric)?.color} 
                    stopOpacity={0.1}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={metrics.find(m => m.id === selectedMetric)?.color} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => metrics.find(m => m.id === selectedMetric)?.format(value)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metrics.find(m => m.id === selectedMetric)?.color}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafice Secundare */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuție Clienți */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Distribuție Clienți</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.clientTypes}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {data.charts.clientTypes.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3B82F6' : '#10B981'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuție Servicii */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Distribuție Servicii</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.serviceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performeri */}
      {userType === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Top Performeri</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Nume</th>
                  <th className="pb-3">Venituri</th>
                  <th className="pb-3">Clienți</th>
                  <th className="pb-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformers.map(performer => (
                  <tr key={performer.id} className="border-b">
                    <td className="py-3">{performer.name}</td>
                    <td className="py-3">{performer.revenue} TC</td>
                    <td className="py-3">{performer.clients}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span>{performer.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default AdvancedStats;