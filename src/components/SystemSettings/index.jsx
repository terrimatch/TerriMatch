// src/components/SystemSettings/index.jsx
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, Users, Globe, Mail, Server, Database } from 'lucide-react';

export function SystemSettings({ isAdmin }) {
 const [settings, setSettings] = useState({
   general: {
     siteName: '',
     siteDescription: '',
     maintenance: false,
     timezone: '',
     language: ''
   },
   security: {
     passwordPolicy: {
       minLength: 8,
       requireNumbers: true,
       requireSpecialChars: true
     },
     sessionTimeout: 30,
     maxLoginAttempts: 5,
     twoFactorAuth: false
   },
   email: {
     provider: 'smtp',
     from: '',
     smtpHost: '',
     smtpPort: '',
     smtpUser: '',
     smtpPass: '',
     templates: {
       welcome: '',
       resetPassword: '',
       notification: ''
     }
   },
   payments: {
     provider: 'stripe',
     testMode: true,
     currency: 'USD',
     minimumAmount: 10,
     commission: 20
   },
   storage: {
     provider: 'local',
     limits: {
       fileSize: 5,
       totalSpace: 1000
     },
     allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
   }
 });

 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [activeTab, setActiveTab] = useState('general');
 const [error, setError] = useState(null);

 useEffect(() => {
   if (!isAdmin) return;
   loadSettings();
 }, [isAdmin]);

 const loadSettings = async () => {
   try {
     setIsLoading(true);
     // Aici ar trebui să încarci setările de la server
     await new Promise(resolve => setTimeout(resolve, 1000));
     setIsLoading(false);
   } catch (error) {
     setError('Eroare la încărcarea setărilor');
     setIsLoading(false);
   }
 };

 const handleSave = async () => {
   try {
     setIsSaving(true);
     // Aici ar trebui să salvezi setările pe server
     await new Promise(resolve => setTimeout(resolve, 1000));
     setIsSaving(false);
   } catch (error) {
     setError('Eroare la salvarea setărilor');
     setIsSaving(false);
   }
 };

 const handleTestEmail = async () => {
   try {
     await fetch('/api/settings/email/test', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(settings.email)
     });
   } catch (error) {
     setError('Eroare la testarea configurării email');
   }
 };

 if (!isAdmin) {
   return (
     <div className="text-center p-8">
       Nu aveți permisiuni pentru această secțiune
     </div>
   );
 }

 if (isLoading) {
   return (
     <div className="flex items-center justify-center p-8">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
     </div>
   );
 }

 return (
   <div className="max-w-4xl mx-auto p-6">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Setări Sistem</h1>
       <button
         onClick={handleSave}
         disabled={isSaving}
         className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
           isSaving
             ? 'bg-gray-400 cursor-not-allowed'
             : 'bg-blue-600 hover:bg-blue-700'
         } text-white`}
       >
         {isSaving ? (
           <RefreshCw className="animate-spin" size={20} />
         ) : (
           <Save size={20} />
         )}
         <span>{isSaving ? 'Se salvează...' : 'Salvează Setările'}</span>
       </button>
     </div>

     {/* Tabs */}
     <div className="flex gap-4 mb-6">
       {[
         { id: 'general', label: 'General', icon: Globe },
         { id: 'security', label: 'Securitate', icon: Shield },
         { id: 'email', label: 'Email', icon: Mail },
         { id: 'storage', label: 'Storage', icon: Database },
         { id: 'payments', label: 'Plăți', icon: Server }
       ].map(tab => (
         <button
           key={tab.id}
           onClick={() => setActiveTab(tab.id)}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
             activeTab === tab.id
               ? 'bg-blue-600 text-white'
               : 'bg-gray-100 hover:bg-gray-200'
           }`}
         >
           <tab.icon size={20} />
           <span>{tab.label}</span>
         </button>
       ))}
     </div>

     {/* Settings Content */}
     <div className="bg-white rounded-lg shadow p-6">
       {activeTab === 'general' && (
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium mb-1">
               Nume Site
             </label>
             <input
               type="text"
               value={settings.general.siteName}
               onChange={e => setSettings({
                 ...settings,
                 general: { ...settings.general, siteName: e.target.value }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Descriere Site
             </label>
             <textarea
               value={settings.general.siteDescription}
               onChange={e => setSettings({
                 ...settings,
                 general: { ...settings.general, siteDescription: e.target.value }
               })}
               rows="3"
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>

           <div className="flex items-center justify-between">
             <div>
               <h3 className="font-medium">Mod Mentenanță</h3>
               <p className="text-sm text-gray-500">
                 Site-ul va fi inaccesibil pentru utilizatori
               </p>
             </div>
             <button
               onClick={() => setSettings({
                 ...settings,
                 general: { ...settings.general, maintenance: !settings.general.maintenance }
               })}
               className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                 settings.general.maintenance ? 'bg-blue-600' : 'bg-gray-200'
               }`}
             >
               <span 
                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                   settings.general.maintenance ? 'translate-x-6' : 'translate-x-1'
                 }`} 
               />
             </button>
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Timezone
             </label>
             <select
               value={settings.general.timezone}
               onChange={e => setSettings({
                 ...settings,
                 general: { ...settings.general, timezone: e.target.value }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             >
               <option value="UTC">UTC</option>
               <option value="Europe/Bucharest">Europe/Bucharest</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Limbă
             </label>
             <select
               value={settings.general.language}
               onChange={e => setSettings({
                 ...settings,
                 general: { ...settings.general, language: e.target.value }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             >
               <option value="ro">Română</option>
               <option value="en">English</option>
             </select>
           </div>
         </div>
       )}

       {activeTab === 'security' && (
         <div className="space-y-4">
           <div>
             <h3 className="font-medium mb-2">Politică Parolă</h3>
             <div className="space-y-2">
               <div>
                 <label className="flex items-center gap-2">
                   <input
                     type="number"
                     value={settings.security.passwordPolicy.minLength}
                     onChange={e => setSettings({
                       ...settings,
                       security: {
                         ...settings.security,
                         passwordPolicy: {
                           ...settings.security.passwordPolicy,
                           minLength: parseInt(e.target.value)
                         }
                       }
                     })}
                     className="w-20 px-2 py-1 border rounded"
                   />
                   <span className="text-sm">Lungime minimă</span>
                 </label>
               </div>

               <label className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={settings.security.passwordPolicy.requireNumbers}
                   onChange={e => setSettings({
                     ...settings,
                     security: {
                       ...settings.security,
                       passwordPolicy: {
                         ...settings.security.passwordPolicy,
                         requireNumbers: e.target.checked
                       }
                     }
                   })}
                   className="rounded border-gray-300"
                 />
                 <span className="text-sm">Necesită cifre</span>
               </label>

               <label className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={settings.security.passwordPolicy.requireSpecialChars}
                   onChange={e => setSettings({
                     ...settings,
                     security: {
                       ...settings.security,
                       passwordPolicy: {
                         ...settings.security.passwordPolicy,
                         requireSpecialChars: e.target.checked
                       }
                     }
                   })}
                   className="rounded border-gray-300"
                 />
                 <span className="text-sm">Necesită caractere speciale</span>
               </label>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Timeout Sesiune (minute)
             </label>
             <input
               type="number"
               value={settings.security.sessionTimeout}
               onChange={e => setSettings({
                 ...settings,
                 security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Încercări maxime de autentificare
             </label>
             <input
               type="number"
               value={settings.security.maxLoginAttempts}
               onChange={e => setSettings({
                 ...settings,
                 security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>

           <div className="flex items-center justify-between">
             <div>
               <h3 className="font-medium">Autentificare în doi pași</h3>
               <p className="text-sm text-gray-500">
                 Obligatoriu pentru toți utilizatorii
               </p>
             </div>
             <button
               onClick={() => setSettings({
                 ...settings,
                 security: { ...settings.security, twoFactorAuth: !settings.security.twoFactorAuth }
               })}
               className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                 settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
               }`}
             >
               <span 
                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                   settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                 }`} 
               />
             </button>
           </div>
         </div>
       )}

       {activeTab === 'email' && (
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium mb-1">
               Provider
             </label>
             <select
               value={settings.email.provider}
               onChange={e => setSettings({
                 ...settings,
                 email: { ...settings.email, provider: e.target.value }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             >
               <option value="smtp">SMTP</option>
               <option value="sendgrid">SendGrid</option>
               <option value="mailgun">Mailgun</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">
               Email From
             </label>
             <input
               type="email"
               value={settings.email.from}
               onChange={e => setSettings({
                 ...settings,
                 email: { ...settings.email, from: e.target.value }
               })}
               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
             />
           </div>

           {settings.email.provider === 'smtp' && (
             <>
               <div>
                 <label className="block text-sm font-medium mb-1">
                   SMTP Host
                 </label>
                 <input
                   type="text"
                   value={settings.email.smtpHost}
                   onChange={e => setSettings({
                     ...settings,
                     email: { ...settings.email, smtpHost: e.target.value }
                   })}
                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   SMTP Port
                 </label>
                 <input
                   type="text"
                   value={settings.email.smtpPort}
                   onChange={e => setSettings({
                     ...settings,
                     email: { ...settings.email, smtpPort: e.target.value }
                   })}
                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                 />
               </div
<label className="block text-sm font-medium mb-1">Provider Plăți</label>
      <select
        value={settings.payments.provider}
        onChange={e => setSettings({
          ...settings,
          payments: { ...settings.payments, provider: e.target.value }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
      </select>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">Mod Test</h3>
        <p className="text-sm text-gray-500">Plăți simulate</p>
      </div>
      <button
        onClick={() => setSettings({
          ...settings,
          payments: { ...settings.payments, testMode: !settings.payments.testMode }
        })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          settings.payments.testMode ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          settings.payments.testMode ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Monedă</label>
      <select
        value={settings.payments.currency}
        onChange={e => setSettings({
          ...settings,
          payments: { ...settings.payments, currency: e.target.value }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="RON">RON</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Sumă Minimă (TC)</label>
      <input
        type="number"
        value={settings.payments.minimumAmount}
        onChange={e => setSettings({
          ...settings,
          payments: { ...settings.payments, minimumAmount: parseInt(e.target.value) }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
)}

{activeTab === 'storage' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Provider Storage</label>
      <select
        value={settings.storage.provider}
        onChange={e => setSettings({
          ...settings,
          storage: { ...settings.storage, provider: e.target.value }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="local">Local</option>
        <option value="s3">Amazon S3</option>
        <option value="google">Google Cloud</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Limită Fișier (MB)</label>
      <input
        type="number"
        value={settings.storage.limits.fileSize}
        onChange={e => setSettings({
          ...settings,
          storage: {
            ...settings.storage,
            limits: { ...settings.storage.limits, fileSize: parseInt(e.target.value) }
          }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Spațiu Total (MB)</label>
      <input
        type="number"
        value={settings.storage.limits.totalSpace}
        onChange={e => setSettings({
          ...settings,
          storage: {
            ...settings.storage,
            limits: { ...settings.storage.limits, totalSpace: parseInt(e.target.value) }
          }
        })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Tipuri Permise</label>
      <div className="space-y-2">
        {['image/jpeg', 'image/png', 'application/pdf'].map(type => (
          <label key={type} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.storage.allowedTypes.includes(type)}
              onChange={e => {
                const newTypes = e.target.checked
                  ? [...settings.storage.allowedTypes, type]
                  : settings.storage.allowedTypes.filter(t => t !== type);
                setSettings({
                  ...settings,
                  storage: { ...settings.storage, allowedTypes: newTypes }
                });
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{type}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
)}