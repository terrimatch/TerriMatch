import React from 'react';
import './styles/global.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TerriCoinStats from './components/TerriCoinStats';
import CallHistory from './components/CallHistory';
import NotificationCenter from './components/NotificationCenter';

const App = () => {
  return (
    <div className="min-h-screen">
      {/* Header cu efect de sticlă */}
      <header className="glass-container fixed top-0 w-full z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo192.png" alt="TerriMatch" className="w-10 h-10" />
            <h1 className="text-xl font-bold">TerriMatch</h1>
          </div>
          <NotificationCenter />
        </div>
      </header>

      {/* Container principal */}
      <main className="container mx-auto pt-20 p-4">
        <div className="glass-container p-6">
          <Tabs defaultValue="matches" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches" className="hover-scale">
                Matches
              </TabsTrigger>
              <TabsTrigger value="calls" className="hover-scale">
                Calls
              </TabsTrigger>
              <TabsTrigger value="wallet" className="hover-scale">
                TerriCoin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cards pentru matches vor fi aici */}
              </div>
            </TabsContent>

            <TabsContent value="calls">
              <CallHistory />
            </TabsContent>

            <TabsContent value="wallet">
              <TerriCoinStats />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer cu efect de sticlă */}
      <footer className="glass-container mt-8 p-4">
        <div className="container mx-auto text-center text-sm text-gray-400">
          TerriMatch © 2024
        </div>
      </footer>
    </div>
  );
};

export default App;
