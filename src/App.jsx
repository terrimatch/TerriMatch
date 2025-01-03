import React, { useState, useEffect } from 'react';
import EnhancedChat from './components/EnhancedChat';
import ChatList from './components/ChatList';
import { WalletModal } from './components/WalletModal';
import { VideoChat } from './components/VideoChat';
import { ProfilesPage } from './pages/ProfilesPage';
import { SettingsPage } from './pages/SettingsPage';
import Registration from './components/Auth/Registration';
import { MessageCircle, Heart, Settings, Users, Wallet, LogIn } from 'lucide-react';
import { initTelegramWebApp, isTelegramWebApp } from './services/telegramService';
import './styles/animations.css';

function App() {
 // State principal
 const [currentPage, setCurrentPage] = useState('welcome');
 const [showWallet, setShowWallet] = useState(false);
 const [showVideoChat, setShowVideoChat] = useState(false);
 const [balance, setBalance] = useState(1000);
 const [activeUsers, setActiveUsers] = useState(245);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [user, setUser] = useState(null);
 const [telegramWebApp, setTelegramWebApp] = useState(null);

 // Inițializare Telegram WebApp
 useEffect(() => {
   if (isTelegramWebApp()) {
     const tg = initTelegramWebApp();
     setTelegramWebApp(tg);
     
     if (tg.initDataUnsafe?.user) {
       const telegramUser = tg.initDataUnsafe.user;
       setUser({
         id: telegramUser.id.toString(),
         name: telegramUser.first_name,
         username: telegramUser.username,
         isTelegram: true
       });
       setIsLoggedIn(true);
     }
   }
 }, []);

 // Simulează actualizarea utilizatorilor activi
 useEffect(() => {
   const interval = setInterval(() => {
     setActiveUsers(prev => Math.max(200, Math.min(300, prev + Math.floor(Math.random() * 11) - 5)));
   }, 30000);
   return () => clearInterval(interval);
 }, []);

 // WebSocket connection
 useEffect(() => {
   const ws = new WebSocket('ws://localhost:3001');

   ws.onopen = () => {
     console.log('Connected to server');
   };

   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     switch (data.type) {
       case 'connection_established':
         setBalance(data.credits);
         break;
       case 'credits_updated':
         setBalance(data.credits);
         break;
       default:
         break;
     }
   };

   return () => {
     ws.close();
   };
 }, []);

 // Navigare
 const navigationItems = [
   { id: 'profiles', icon: Heart, label: 'Profiles', requiresAuth: true },
   { id: 'chat', icon: MessageCircle, label: 'Chat', requiresAuth: true },
   { id: 'settings', icon: Settings, label: 'Settings', requiresAuth: true }
 ];

 // Welcome Screen
 const WelcomeScreen = () => (
   <div className="h-full flex items-center justify-center">
     <div className="max-w-lg text-center p-8">
       <h1 className="text-4xl font-bold mb-4">Bine ai venit pe TerriMatch</h1>
       <p className="text-gray-600 mb-8">
         Platformă de dating și servicii personalizate
       </p>
       <button
         onClick={() => setCurrentPage('register')}
         className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
       >
         Înregistrează-te pentru a începe
       </button>
     </div>
   </div>
 );

 // Handlers
 const handleAddCoins = (amount) => {
   setBalance(prev => prev + amount);
 };

 const handleVideoCall = () => {
   if (balance < 50) {
     return;
   }
   setShowVideoChat(true);
 };

 const handleMatch = (matchData) => {
   // Handle match logic
 };

 const handleRegistrationSuccess = async (userData) => {
   if (telegramWebApp && telegramWebApp.initDataUnsafe?.user) {
     userData = {
       ...userData,
       telegramId: telegramWebApp.initDataUnsafe.user.id,
       username: telegramWebApp.initDataUnsafe.user.username
     };
   }

   setUser(userData);
   setIsLoggedIn(true);
   setCurrentPage('profiles');
 };

 const renderMainContent = () => {
   if (!isLoggedIn && currentPage !== 'register' && currentPage !== 'welcome') {
     return <WelcomeScreen />;
   }

   switch(currentPage) {
     case 'welcome':
       return <WelcomeScreen />;
     case 'register':
       return <Registration onSuccess={handleRegistrationSuccess} />;
     case 'chat':
       return (
         <div className="flex h-full">
           <div className="w-80 border-r bg-gray-50">
             <ChatList />
           </div>
           <div className="flex-1">
             <EnhancedChat 
               chatId="123"
               userId={user?.id}
               onStartVideoCall={handleVideoCall}
             />
           </div>
         </div>
       );
     case 'profiles':
       return <ProfilesPage onMatch={handleMatch} onVideoCall={handleVideoCall} />;
     case 'settings':
       return <SettingsPage user={user} onUpdate={setUser} />;
     default:
       return <WelcomeScreen />;
   }
 };

 return (
   <div className="min-h-screen bg-gray-50">
     <div className="flex h-screen">
       {/* Sidebar - doar pentru utilizatori autentificați */}
       {isLoggedIn && (
         <div className="w-20 bg-blue-900 flex flex-col items-center py-8">
           <div className="flex-1 flex flex-col gap-6">
             {navigationItems.map(item => (
               <button
                 key={item.id}
                 onClick={() => setCurrentPage(item.id)}
                 className={`p-3 rounded-xl transition-colors ${
                   currentPage === item.id
                     ? 'bg-blue-800 text-white'
                     : 'text-white/70 hover:text-white hover:bg-blue-800'
                 }`}
                 title={item.label}
               >
                 <item.icon size={24} />
               </button>
             ))}
           </div>

           <div className="mt-auto flex flex-col gap-4">
             <button
               onClick={() => setShowWallet(true)}
               className="p-3 text-white/70 hover:text-white hover:bg-blue-800 rounded-xl"
               title="Wallet"
             >
               <Wallet size={24} />
             </button>
           </div>
         </div>
       )}

       {/* Main content */}
       <div className="flex-1 flex flex-col">
         {/* Header */}
         <header className="bg-white border-b p-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold">TerriMatch</h1>
             <div className="flex items-center gap-2 text-gray-500">
               <Users size={16} />
               <span>{activeUsers} online</span>
             </div>
           </div>

           <div className="flex items-center gap-4">
             {!isLoggedIn && currentPage !== 'register' && (
               <button
                 onClick={() => setCurrentPage('register')}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <LogIn size={20} />
                 Înregistrare
               </button>
             )}

             {isLoggedIn && (
               <div 
                 onClick={() => setShowWallet(true)}
                 className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors"
               >
                 <Wallet className="text-blue-600" size={20} />
                 <div>
                   <p className="text-sm text-gray-500">Balance</p>
                   <p className="font-bold text-blue-600">{balance} TC</p>
                 </div>
               </div>
             )}
           </div>
         </header>

         {/* Page content */}
         <main className="flex-1 overflow-y-auto">
           {renderMainContent()}
         </main>
       </div>
     </div>

     {/* Modals */}
     {isLoggedIn && (
       <>
         <WalletModal
           isOpen={showWallet}
           onClose={() => setShowWallet(false)}
           balance={balance}
           onAddCoins={handleAddCoins}
         />

         <VideoChat
           isOpen={showVideoChat}
           onClose={() => setShowVideoChat(false)}
         />
       </>
     )}
   </div>
 );
}

export default App;