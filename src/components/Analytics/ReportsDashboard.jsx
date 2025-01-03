// src/components/Analytics/ReportsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';

export function ReportsDashboard({ userId, userType }) {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('earnings');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // Aici ar trebui să încarci datele reale de la server
      // Pentru exemplu folosim date statice
      const mockData = {
        earnings: {
          total: 5000,
          trend: +15,
          data: [
            { date: '2024-01-01', value: 400 },
            { date: '2024-01-02', value: 300 },
            // ... mai multe date
          ]
        },
        clients: {
          total: 150,
          newClients: 12,
          returningClients: 138
        },
        bookings: {
          completed: 45,
          canceled: 5,
          pending: 8
        },
        // ... alte metrici
      };

      setData(mockData);
    } catch (error) {
      setError('Eroare la încărcarea datelor');
    } finally {
      setIsLoading(false);
    }
  };

  [Continuă cu restul implementării...]
  const metrics = [
    {
      id: 'earnings',
      label: 'Venituri',
      icon: DollarSign,
      color: '#10B981',
      format: (value) => `${value} TC`
    },
    {
      id: 'bookings',
      label: 'Rezervări',
      icon: Calendar,
      color: '#3B82F6',
      format: (value) => value
    },
    {
      id: 'clients',
      label: 'Clienți',
      icon: Users,
      color: '#F59E0B',
      format: (value) => value
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
    { value: '7d', label: 'Ultimele 7 zile' },
    { value: '30d', label: 'Ultima lună' },
    { value: '90d', label: 'Ultimele 3 luni' },
    { value: '1y', label: 'Ultimul an' }
  ];
 
  const downloadReport = async () => {
    try {
      // Aici ar trebui să generezi și să descarci raportul
      const response = await fetch(`/api/reports/download?timeRange=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${timeRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Eroare la descărcarea raportului');
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
        <h1 className="text-2xl font-bold">Rapoarte și Analiză</h1>
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
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            Descarcă Raport
          </button>
        </div>
      </div>
 
      {/* Metrici Principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveMetric(metric.id)}
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
              {data[metric.id]?.trend && (
                <div className="flex items-center gap-1">
                  <TrendingUp 
                    size={16} 
                    className={data[metric.id].trend >= 0 ? 'text-green-500' : 'text-red-500'} 
                  />
                  <span className={data[metric.id].trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(data[metric.id].trend)}%
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-gray-500">{metric.label}</h3>
            <p className="text-2xl font-bold mt-1">
              {metric.format(data[metric.id]?.total || 0)}
            </p>
          </div>
        ))}
      </div>
 
      {/* Grafic Principal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {metrics.find(m => m.id === activeMetric)?.label}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Filter size={20} />
            </button>
          </div>
        </div>
 
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data[activeMetric]?.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => metrics.find(m => m.id === activeMetric)?.format(value)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metrics.find(m => m.id === activeMetric)?.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Statistici Detaliate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuție Clienți */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Distribuție Clienți</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Noi', value: data.clients?.newClients || 0 },
                    { name: 'Recurenți', value: data.clients?.returningClients || 0 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Status Rezervări */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Status Rezervări</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Completate', value: data.bookings?.completed || 0 },
                  { name: 'Anulate', value: data.bookings?.canceled || 0 },
                  { name: 'În așteptare', value: data.bookings?.pending || 0 }
                ]}
              >
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
 
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
 }
 
 export default ReportsDashboard;