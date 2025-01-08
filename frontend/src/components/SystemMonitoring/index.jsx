// src/components/SystemMonitoring/index.jsx
import React, { useState, useEffect } from 'react';
import { 
 Activity, Server, Database, Users, 
 Memory, Cpu, HardDrive, AlertTriangle 
} from 'lucide-react';
import { 
 LineChart, Line, AreaChart, Area, CartesianGrid, 
 XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

export function SystemMonitoring({ isAdmin }) {
 const [metrics, setMetrics] = useState({
   system: {
     cpu: 45,
     memory: 62,
     disk: 78,
     uptime: '15d 7h 23m'
   },
   app: {
     activeUsers: 245,
     requests: 1250,
     responseTime: 120,
     errorRate: 0.5
   },
   database: {
     connections: 85,
     queryTime: 45,
     storage: 75
   },
   history: {
     cpu: [],
     memory: [],
     requests: []
   }
 });

 const [alerts, setAlerts] = useState([
   {
     id: 1,
     type: 'warning',
     message: 'CPU usage over 80%',
     timestamp: new Date()
   }
 ]);

 useEffect(() => {
   if (!isAdmin) return;
   const interval = setInterval(updateMetrics, 5000);
   return () => clearInterval(interval);
 }, [isAdmin]);

 const updateMetrics = async () => {
   try {
     const response = await fetch('/api/monitoring/metrics');
     const data = await response.json();
     setMetrics(data);
   } catch (error) {
     console.error('Error fetching metrics:', error);
   }
 };

 return (
   <div className="max-w-7xl mx-auto p-6">
     {/* System Health Overview */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
       <div className="bg-white p-6 rounded-lg shadow">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Cpu className="text-blue-500" size={24} />
             <h3 className="font-medium">CPU Usage</h3>
           </div>
           <span className="text-2xl font-bold">{metrics.system.cpu}%</span>
         </div>
         <ResponsiveContainer width="100%" height={100}>
           <AreaChart data={metrics.history.cpu}>
             <Area 
               type="monotone" 
               dataKey="value" 
               stroke="#3B82F6" 
               fill="#93C5FD" 
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>

       <div className="bg-white p-6 rounded-lg shadow">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Memory className="text-green-500" size={24} />
             <h3 className="font-medium">Memory Usage</h3>
           </div>
           <span className="text-2xl font-bold">{metrics.system.memory}%</span>
         </div>
         <ResponsiveContainer width="100%" height={100}>
           <AreaChart data={metrics.history.memory}>
             <Area 
               type="monotone" 
               dataKey="value" 
               stroke="#10B981" 
               fill="#6EE7B7" 
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>

       <div className="bg-white p-6 rounded-lg shadow">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <HardDrive className="text-purple-500" size={24} />
             <h3 className="font-medium">Disk Usage</h3>
           </div>
           <span className="text-2xl font-bold">{metrics.system.disk}%</span>
         </div>
         <div className="relative pt-1">
           <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
             <div 
               style={{ width: `${metrics.system.disk}%` }}
               className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
             />
           </div>
         </div>
       </div>

       <div className="bg-white p-6 rounded-lg shadow">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Users className="text-yellow-500" size={24} />
             <h3 className="font-medium">Active Users</h3>
           </div>
           <span className="text-2xl font-bold">{metrics.app.activeUsers}</span>
         </div>
         <ResponsiveContainer width="100%" height={100}>
           <AreaChart data={metrics.history.requests}>
             <Area 
               type="monotone" 
               dataKey="value" 
               stroke="#F59E0B" 
               fill="#FCD34D" 
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>
     </div>

     {/* Application Metrics */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
       <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-semibold mb-4">Application Performance</h3>
         <div className="space-y-4">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Activity size={20} className="text-gray-400" />
               <span>Response Time</span>
             </div>
             <span className="font-medium">{metrics.app.responseTime}ms</span>
           </div>
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <AlertTriangle size={20} className="text-gray-400" />
               <span>Error Rate</span>
             </div>
             <span className="font-medium">{metrics.app.errorRate}%</span>
           </div>
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Server size={20} className="text-gray-400" />
               <span>Total Requests</span>
             </div>
             <span className="font-medium">{metrics.app.requests}</span>
           </div>
         </div>
       </div>

       <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-semibold mb-4">Database Health</h3>
         <div className="space-y-4">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Database size={20} className="text-gray-400" />
               <span>Active Connections</span>
             </div>
             <span className="font-medium">{metrics.database.connections}</span>
           </div>
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Clock size={20} className="text-gray-400" />
               <span>Avg Query Time</span>
             </div>
             <span className="font-medium">{metrics.database.queryTime}ms</span>
           </div>
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <HardDrive size={20} className="text-gray-400" />
               <span>Storage Usage</span>
             </div>
             <span className="font-medium">{metrics.database.storage}%</span>
           </div>
         </div>
       </div>
     </div>

     {/* System Alerts */}
     <div className="bg-white p-6 rounded-lg shadow">
       <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
       <div className="space-y-4">
         {alerts.map(alert => (
           <div 
             key={alert.id}
             className={`p-4 rounded-lg ${
               alert.type === 'warning' 
                 ? 'bg-yellow-50 text-yellow-700'
                 : 'bg-red-50 text-red-700'
             }`}
           >
             <div className="flex items-center gap-2">
               <AlertTriangle size={20} />
               <div>
                 <p className="font-medium">{alert.message}</p>
                 <p className="text-sm">
                   {new Date(alert.timestamp).toLocaleString()}
                 </p>
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>
   </div>
 );
}

export default SystemMonitoring;