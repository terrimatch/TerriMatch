import React from 'react';
import { Heart, MessageCircle, Settings, LogOut, Users, Wallet } from 'lucide-react';

export function Layout({ children, currentPage, onNavigate, onLogout, onWallet, balance }) {
  const navigationItems = [
    { id: 'profiles', icon: Heart, label: 'Profiles' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-20 bg-blue-900 flex flex-col items-center py-8">
        <div className="flex-1 flex flex-col gap-6">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
            onClick={onWallet}
            className="p-3 text-white/70 hover:text-white hover:bg-blue-800 rounded-xl transition-colors"
            title="Wallet"
          >
            <Wallet size={24} />
          </button>
          <button
            onClick={onLogout}
            className="p-3 text-white/70 hover:text-white hover:bg-blue-800 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">TerriMatch</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={16} />
              <span>245 online</span>
            </div>
          </div>

          <div
            onClick={onWallet}
            className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <Wallet className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-bold text-blue-600">{balance} TC</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;