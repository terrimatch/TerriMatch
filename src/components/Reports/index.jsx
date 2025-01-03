// src/components/Reports/index.jsx
import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Clock, FileText, Printer, Send } from 'lucide-react';

export function Reports({ userId }) {
 const [reports, setReports] = useState([]);
 const [selectedReportType, setSelectedReportType] = useState('financial');
 const [dateRange, setDateRange] = useState({
   start: '',
   end: ''
 });
 const [isGenerating, setIsGenerating] = useState(false);
 const [error, setError] = useState(null);

 const reportTypes = {
   financial: {
     label: 'Raport Financiar',
     sections: ['revenue', 'expenses', 'profits', 'transactions'],
     formats: ['pdf', 'excel', 'csv']
   },
   activity: {
     label: 'Raport Activitate',
     sections: ['bookings', 'hours', 'services', 'ratings'],
     formats: ['pdf', 'excel']
   },
   clients: {
     label: 'Raport Clienți',
     sections: ['new', 'recurring', 'demographics', 'satisfaction'],
     formats: ['pdf', 'excel', 'csv']
   },
   performance: {
     label: 'Raport Performanță',
     sections: ['metrics', 'goals', 'comparison', 'trends'],
     formats: ['pdf']
   }
 };

 useEffect(() => {
   loadReports();
 }, [userId]);

 const loadReports = async () => {
   try {
     // Simulare date
     const mockReports = [
       {
         id: 'REP-001',
         type: 'financial',
         dateRange: {
           start: '2024-01-01',
           end: '2024-01-31'
         },
         generatedAt: new Date(),
         status: 'completed',
         format: 'pdf',
         url: '/reports/REP-001.pdf'
       }
     ];
     setReports(mockReports);
   } catch (error) {
     setError('Eroare la încărcarea rapoartelor');
   }
 };

 const handleGenerateReport = async () => {
   try {
     setIsGenerating(true);
     
     const reportConfig = {
       type: selectedReportType,
       dateRange,
       format: 'pdf', // sau alt format selectat
       sections: reportTypes[selectedReportType].sections
     };

     // Aici ar trebui să generezi raportul pe server
     await new Promise(resolve => setTimeout(resolve, 2000));

     setIsGenerating(false);
     loadReports(); // Reîncarcă lista după generare
   } catch (error) {
     setError('Eroare la generarea raportului');
     setIsGenerating(false);
   }
 };

 const handleDownloadReport = async (reportId) => {
   try {
     // Aici ar trebui să descarci raportul de pe server
     const response = await fetch(`/api/reports/${reportId}/download`);
     const blob = await response.blob();
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `report-${reportId}.pdf`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     window.URL.revokeObjectURL(url);
   } catch (error) {
     setError('Eroare la descărcarea raportului');
   }
 };

 const handleEmailReport = async (reportId) => {
   try {
     await fetch(`/api/reports/${reportId}/email`, {
       method: 'POST'
     });
     // Afișează confirmare
   } catch (error) {
     setError('Eroare la trimiterea raportului pe email');
   }
 };

 return (
   <div className="max-w-4xl mx-auto p-6">
     {/* Generator Rapoarte */}
     <div className="bg-white p-6 rounded-lg shadow mb-6">
       <h2 className="text-xl font-semibold mb-4">Generează Raport Nou</h2>
       
       <div className="space-y-4">
         <div>
           <label className="block text-sm font-medium mb-1">
             Tip Raport
           </label>
           <select
             value={selectedReportType}
             onChange={(e) => setSelectedReportType(e.target.value)}
             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
           >
             {Object.entries(reportTypes).map(([type, data]) => (
               <option key={type} value={type}>
                 {data.label}
               </option>
             ))}
           </select>
         </div>

         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">
               Data Început
             </label>
             <input
               type="date"
               value={dateRange.start}
               onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium mb-1">
               Data Sfârșit
             </label>
             <input
               type="date"
               value={dateRange.end}
               onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>
         </div>

         {/* Secțiuni Raport */}
         <div>
           <label className="block text-sm font-medium mb-1">
             Secțiuni Incluse
           </label>
           <div className="grid grid-cols-2 gap-2">
             {reportTypes[selectedReportType].sections.map(section => (
               <label key={section} className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   defaultChecked
                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-sm">
                   {section.charAt(0).toUpperCase() + section.slice(1)}
                 </span>
               </label>
             ))}
           </div>
         </div>

         {/* Format Export */}
         <div>
           <label className="block text-sm font-medium mb-1">
             Format Export
           </label>
           <div className="flex gap-4">
             {reportTypes[selectedReportType].formats.map(format => (
               <label key={format} className="flex items-center gap-2">
                 <input
                   type="radio"
                   name="format"
                   value={format}
                   defaultChecked={format === 'pdf'}
                   className="border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-sm uppercase">{format}</span>
               </label>
             ))}
           </div>
         </div>

         <button
           onClick={handleGenerateReport}
           disabled={isGenerating}
           className={`w-full py-2 rounded-lg ${
             isGenerating
               ? 'bg-gray-400 cursor-not-allowed'
               : 'bg-blue-600 hover:bg-blue-700'
           } text-white`}
         >
           {isGenerating ? 'Se generează...' : 'Generează Raport'}
         </button>
       </div>
     </div>

     {/* Lista Rapoarte Generate */}
     <div className="bg-white p-6 rounded-lg shadow">
       <h2 className="text-xl font-semibold mb-4">Rapoarte Generate</h2>

       <div className="space-y-4">
         {reports.map(report => (
           <div
             key={report.id}
             className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
           >
             <div>
               <div className="flex items-center gap-2">
                 <FileText className="text-gray-400" size={20} />
                 <h3 className="font-medium">
                   {reportTypes[report.type].label}
                 </h3>
               </div>

               <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                 <div className="flex items-center gap-1">
                   <Calendar size={14} />
                   <span>
                     {new Date(report.dateRange.start).toLocaleDateString()} - 
                     {new Date(report.dateRange.end).toLocaleDateString()}
                   </span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Clock size={14} />
                   <span>
                     Generat: {new Date(report.generatedAt).toLocaleString()}
                   </span>
                 </div>
               </div>
             </div>

             <div className="flex items-center gap-2">
               <button
                 onClick={() => handleDownloadReport(report.id)}
                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                 title="Descarcă"
               >
                 <Download size={20} />
               </button>
               <button
                 onClick={() => handleEmailReport(report.id)}
                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                 title="Trimite pe Email"
               >
                 <Send size={20} />
               </button>
               <button
                 onClick={() => handlePrintReport(report.id)}
                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                 title="Printează"
               >
                 <Printer size={20} />
               </button>
             </div>
           </div>
         ))}

         {reports.length === 0 && (
           <div className="text-center py-8 text-gray-500">
             Nu există rapoarte generate
           </div>
         )}
       </div>
     </div>

     {error && (
       <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
         {error}
       </div>
     )}
   </div>
 );
}

export default Reports;