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
import backgroundImage from './images/background.jpg';

function App() {
 const [currentPage, setCurrentPage] = useState('welcome');
 const [showWallet, setShowWallet] = useState(false);
 const [showVideoChat, setShowVideoChat] = useState(false);
 const [balance, setBalance] = useState(1000);
 const [activeUsers, setActiveUsers] = useState(245);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [user, setUser] = useState(null);
 const [telegramWebApp, setTelegramWebApp] = useState(null);

 useEffect(() => {
   const tg = window.Telegram?.WebApp;
   if (tg) {
     tg.ready();
     tg.expand();
     
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

 useEffect(() => {
   const interval = setInterval(() => {
     setActiveUsers(prev => Math.max(200, Math.min(300, prev + Math.floor(Math.random() * 11) - 5)));
   }, 30000);
   return () => clearInterval(interval);
 }, []);

 const navigationItems = [
   { id: 'profiles', icon: Heart, label: 'Profiles', requiresAuth: true },
   { id: 'chat', icon: MessageCircle, label: 'Chat', requiresAuth: true },
   { id: 'settings', icon: Settings, label: 'Settings', requiresAuth: true }
 ];

 const handleAddCoins = (amount) => {
   if (!isLoggedIn) return;
   setBalance(prev => prev + amount);
 };

 const handleMatch = (matchData) => {
   if (!isLoggedIn) return;
 };

 const handleVideoCall = () => {
   if (!isLoggedIn || balance < 50) return;
   setShowVideoChat(true);
 };

 const handleRegistrationSuccess = async (userData) => {
   if (telegramWebApp?.initDataUnsafe?.user) {
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

 const WelcomeScreen = () => (
   <div className="h-full flex items-center justify-center">
     <div className="max-w-lg text-center p-8 glass-effect rounded-lg">
       <h1 className="text-4xl font-bold mb-4 text-white">Bine ai venit pe TerriMatch</h1>
       <p className="text-gray-200 mb-8">
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
           <div className="w-80 border-r glass-effect">
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
   <div className="min-h-screen" style={{
     backgroundImage: `url(${backgroundImage})`,
     backgroundSize: 'cover',
     backgroundPosition: 'center',
     backgroundRepeat: 'no-repeat'
   }}>
     <div className="flex h-screen">
       {isLoggedIn && (
         <div className="w-20 glass-effect flex flex-col items-center py-8">
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

       <div className="flex-1 flex flex-col">
         <header className="glass-effect border-b p-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold text-white">TerriMatch</h1>
             <div className="flex items-center gap-2 text-gray-300">
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
                 className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-700/20 transition-colors"
               >
                 <Wallet className="text-white" size={20} />
                 <div>
                   <p className="text-sm text-gray-300">Balance</p>
                   <p className="font-bold text-white">{balance} TC</p>
                 </div>
               </div>
             )}
           </div>
         </header>

         <main className="flex-1 overflow-y-auto glass-effect">
           {renderMainContent()}
         </main>
       </div>
     </div>

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