import React, { useState, useEffect } from 'react';
import { isTelegramWebApp, connectTelegramUser } from '../../services/telegramService';

export function Registration({ onSuccess }) {
 const [formData, setFormData] = useState({
   category: '',
   age: '',
   name: '',
   description: '',
   telegram: '',
   serviceType: '',
   priceRange: '',
   availability: '',
   location: ''
 });

 const categories = [
   { id: 'regular', name: 'Utilizator Regular' },
   { id: 'provider', name: 'Furnizor de Servicii' }
 ];

 const serviceTypes = [
   { id: 'dating', name: 'Dating' },
   { id: 'escort', name: 'Escort' },
   { id: 'massage', name: 'Masaj' }
 ];

 useEffect(() => {
   if (isTelegramWebApp()) {
     const tg = window.Telegram.WebApp;
     if (tg.initDataUnsafe?.user) {
       setFormData(prev => ({
         ...prev,
         name: tg.initDataUnsafe.user.first_name || '',
         telegram: tg.initDataUnsafe.user.username || ''
       }));
     }
   }
 }, []);

 const renderExtraFields = () => {
   if (formData.category === 'provider') {
     return (
       <>
         <div>
           <label className="block text-sm font-medium mb-1">Tip Serviciu</label>
           <select 
             value={formData.serviceType}
             onChange={e => setFormData({...formData, serviceType: e.target.value})}
             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
             required
           >
             <option value="">Selectează tipul serviciului</option>
             {serviceTypes.map(type => (
               <option key={type.id} value={type.id}>{type.name}</option>
             ))}
           </select>
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Preț/Oră</label>
           <input 
             type="number"
             value={formData.priceRange}
             onChange={e => setFormData({...formData, priceRange: e.target.value})}
             className="w-full p-2 border rounded"
             placeholder="Preț în TerriCoin"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Program Disponibil</label>
           <input 
             type="text"
             value={formData.availability}
             onChange={e => setFormData({...formData, availability: e.target.value})}
             className="w-full p-2 border rounded"
             placeholder="Ex: Luni-Vineri, 10:00-18:00"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Locație</label>
           <input 
             type="text"
             value={formData.location}
             onChange={e => setFormData({...formData, location: e.target.value})}
             className="w-full p-2 border rounded"
             placeholder="Oraș/Regiune"
             required
           />
         </div>
       </>
     );
   }
   return null;
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   
   if (isTelegramWebApp()) {
     const tg = window.Telegram.WebApp;
     const user = tg.initDataUnsafe?.user;
     
     if (user) {
       try {
         const result = await connectTelegramUser(user.id, user.username);
         if (result.success) {
           onSuccess({
             ...formData,
             telegramId: user.id,
             username: user.username
           });
         } else {
           // Handle error
           console.error('Error connecting Telegram user:', result.error);
         }
       } catch (error) {
         console.error('Registration error:', error);
       }
     }
   } else {
     // Handle non-Telegram registration
     onSuccess(formData);
   }
 };

 return (
   <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
     <h2 className="text-2xl font-bold mb-6">Înregistrare</h2>
     <form onSubmit={handleSubmit} className="space-y-4">
       <div>
         <label className="block text-sm font-medium mb-1">Categorie</label>
         <select 
           value={formData.category}
           onChange={e => setFormData({...formData, category: e.target.value})}
           className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
           required
         >
           <option value="">Selectează categoria</option>
           {categories.map(cat => (
             <option key={cat.id} value={cat.id}>{cat.name}</option>
           ))}
         </select>
       </div>

       <div>
         <label className="block text-sm font-medium mb-1">Nume</label>
         <input 
           type="text"
           value={formData.name}
           onChange={e => setFormData({...formData, name: e.target.value})}
           className="w-full p-2 border rounded"
           required
         />
       </div>

       <div>
         <label className="block text-sm font-medium mb-1">Vârstă</label>
         <input 
           type="number"
           value={formData.age}
           onChange={e => setFormData({...formData, age: e.target.value})}
           className="w-full p-2 border rounded"
           required
           min="18"
         />
       </div>

       <div>
         <label className="block text-sm font-medium mb-1">Descriere</label>
         <textarea 
           value={formData.description}
           onChange={e => setFormData({...formData, description: e.target.value})}
           className="w-full p-2 border rounded"
           rows="3"
           required
         />
       </div>

       {renderExtraFields()}

       <div>
         <label className="block text-sm font-medium mb-1">Username Telegram</label>
         <input 
           type="text"
           value={formData.telegram}
           onChange={e => setFormData({...formData, telegram: e.target.value})}
           className="w-full p-2 border rounded"
           required
         />
       </div>

       <button
         type="submit"
         className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
       >
         {isTelegramWebApp() ? 'Finalizează Înregistrarea' : 'Conectare cu Telegram'}
       </button>
     </form>
   </div>
 );
}

export default Registration;