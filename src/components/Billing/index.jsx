// src/components/Billing/index.jsx
import React, { useState, useEffect } from 'react';
import { 
 DollarSign, 
 Calendar, 
 Download, 
 Clock,
 FileText,
 Filter,
 ChevronDown,
 RefreshCw 
} from 'lucide-react';

export function Billing({ userId }) {
 const [invoices, setInvoices] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [activeView, setActiveView] = useState('invoices');
 const [timeRange, setTimeRange] = useState('30d');
 const [filter, setFilter] = useState('all');
 const [error, setError] = useState(null);

 const timeRanges = [
   { value: '30d', label: 'Ultima lună' },
   { value: '90d', label: 'Ultimele 3 luni' },
   { value: '1y', label: 'Ultimul an' }
 ];

 const filterOptions = [
   { value: 'all', label: 'Toate' },
   { value: 'paid', label: 'Plătite' },
   { value: 'pending', label: 'În așteptare' },
   { value: 'overdue', label: 'Restante' }
 ];

 useEffect(() => {
   loadBillingData();
 }, [userId, timeRange, filter]);

 const loadBillingData = async () => {
   try {
     setIsLoading(true);
     
     // Aici ar trebui să încarci datele reale de la server
     const mockInvoices = [
       {
         id: 'INV-001',
         amount: 500,
         status: 'paid',
         dueDate: new Date('2024-02-01'),
         paidDate: new Date('2024-01-28'),
         items: [
           {
             description: 'Video Call Services',
             quantity: 5,
             price: 100,
             total: 500
           }
         ]
       }
     ];

     const mockTransactions = [
       {
         id: 'TRX-001',
         type: 'credit',
         amount: 500,
         status: 'completed',
         description: 'Payment for INV-001',
         timestamp: new Date('2024-01-28'),
         method: 'credit_card'
       }
     ];

     setInvoices(mockInvoices);
     setTransactions(mockTransactions);
   } catch (error) {
     setError('Eroare la încărcarea datelor de facturare');
   } finally {
     setIsLoading(false);
   }
 };

 const handleDownloadInvoice = async (invoiceId) => {
   try {
     const response = await fetch(`/api/billing/invoices/${invoiceId}/download`);
     const blob = await response.blob();
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `invoice-${invoiceId}.pdf`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     window.URL.revokeObjectURL(url);
   } catch (error) {
     setError('Eroare la descărcarea facturii');
   }
 };

 const filteredInvoices = invoices.filter(invoice => {
   if (filter === 'all') return true;
   return invoice.status === filter;
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
       <h1 className="text-2xl font-bold">Facturare și Plăți</h1>
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

         <select
           value={filter}
           onChange={(e) => setFilter(e.target.value)}
           className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
         >
           {filterOptions.map(option => (
             <option key={option.value} value={option.value}>
               {option.label}
             </option>
           ))}
         </select>
       </div>
     </div>

     {/* Tabs */}
     <div className="flex gap-4 mb-6">
       <button
         onClick={() => setActiveView('invoices')}
         className={`px-4 py-2 rounded-lg ${
           activeView === 'invoices'
             ? 'bg-blue-600 text-white'
             : 'bg-gray-100 hover:bg-gray-200'
         }`}
       >
         Facturi
       </button>
       <button
         onClick={() => setActiveView('transactions')}
         className={`px-4 py-2 rounded-lg ${
           activeView === 'transactions'
             ? 'bg-blue-600 text-white'
             : 'bg-gray-100 hover:bg-gray-200'
         }`}
       >
         Tranzacții
       </button>
     </div>

     {/* Facturi */}
     {activeView === 'invoices' && (
       <div className="space-y-4">
         {filteredInvoices.map(invoice => (
           <div
             key={invoice.id}
             className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
           >
             <div className="flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2">
                   <h3 className="font-medium">{invoice.id}</h3>
                   <span className={`px-2 py-1 text-sm rounded-full ${
                     invoice.status === 'paid'
                       ? 'bg-green-100 text-green-600'
                       : invoice.status === 'pending'
                       ? 'bg-yellow-100 text-yellow-600'
                       : 'bg-red-100 text-red-600'
                   }`}>
                     {invoice.status === 'paid' ? 'Plătită' : 
                      invoice.status === 'pending' ? 'În așteptare' : 'Restantă'}
                   </span>
                 </div>

                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                   <div className="flex items-center gap-1">
                     <Calendar size={14} />
                     <span>Scadentă: {invoice.dueDate.toLocaleDateString()}</span>
                   </div>
                   {invoice.paidDate && (
                     <div className="flex items-center gap-1">
                       <Clock size={14} />
                       <span>Plătită: {invoice.paidDate.toLocaleDateString()}</span>
                     </div>
                   )}
                 </div>
               </div>

               <div className="text-right">
                 <p className="text-2xl font-bold">{invoice.amount} TC</p>
                 <button
                   onClick={() => handleDownloadInvoice(invoice.id)}
                   className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-2"
                 >
                   <Download size={16} />
                   <span>Descarcă PDF</span>
                 </button>
               </div>
             </div>

             <div className="mt-4">
               <table className="w-full">
                 <thead>
                   <tr className="text-left text-sm text-gray-500 border-b">
                     <th className="pb-2">Descriere</th>
                     <th className="pb-2">Cantitate</th>
                     <th className="pb-2">Preț</th>
                     <th className="pb-2 text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {invoice.items.map((item, index) => (
                     <tr key={index} className="border-b last:border-0">
                       <td className="py-2">{item.description}</td>
                       <td className="py-2">{item.quantity}</td>
                       <td className="py-2">{item.price} TC</td>
                       <td className="py-2 text-right">{item.total} TC</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         ))}

         {filteredInvoices.length === 0 && (
           <div className="text-center py-8 text-gray-500">
             Nu există facturi pentru perioada selectată
           </div>
         )}
       </div>
     )}

     {/* Tranzacții */}
     {activeView === 'transactions' && (
       <div className="space-y-4">
         {transactions.map(transaction => (
           <div
             key={transaction.id}
             className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
           >
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className={`p-2 rounded-lg ${
                   transaction.type === 'credit'
                     ? 'bg-green-100'
                     : 'bg-red-100'
                 }`}>
                   <DollarSign 
                     className={transaction.type === 'credit' 
                       ? 'text-green-600' 
                       : 'text-red-600'
                     } 
                     size={20} 
                   />
                 </div>

                 <div>
                   <h3 className="font-medium">{transaction.description}</h3>
                   <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                     <div className="flex items-center gap-1">
                       <Clock size={14} />
                       <span>{transaction.timestamp.toLocaleString()}</span>
                     </div>
                     <span>{transaction.method}</span>
                   </div>
                 </div>
               </div>

               <div className="text-right">
                 <p className={`text-lg font-bold ${
                   transaction.type === 'credit'
                     ? 'text-green-600'
                     : 'text-red-600'
                 }`}>
                   {transaction.type === 'credit' ? '+' : '-'}
                   {transaction.amount} TC
                 </p>
                 <p className="text-sm text-gray-500">
                   {transaction.status}
                 </p>
               </div>
             </div>
           </div>
         ))}

         {transactions.length === 0 && (
           <div className="text-center py-8 text-gray-500">
             Nu există tranzacții pentru perioada selectată
           </div>
         )}
       </div>
     )}

     {error && (
       <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
         {error}
       </div>
     )}
   </div>
 );
}

export default Billing;