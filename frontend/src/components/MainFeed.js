import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import TerriCoinStats from './TerriCoinStats';
import CallHistory from './CallHistory';
import VideoChat from './VideoChat';
import CallNotification from './CallNotification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Video, History, Coins } from 'lucide-react';

const MainFeed = () => {
    const [activeTab, setActiveTab] = useState('feed');
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [userBalance, setUserBalance] = useState(0);

    useEffect(() => {
        checkBalance();
        setupCallListener();
    }, []);

    const checkBalance = async () => {
        try {
            const { data: wallet } = await supabase
                .from('wallets')
                .select('balance')
                .single();
            
            setUserBalance(wallet?.balance || 0);
        } catch (error) {
            console.error('Error checking balance:', error);
        }
    };

    const setupCallListener = () => {
        const subscription = supabase
            .channel('video_signals')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'video_signals',
                filter: `to_user_id=eq.${supabase.auth.user().id}`
            }, handleCallSignal)
            .subscribe();

        return () => subscription.unsubscribe();
    };

    const handleCallSignal = async (payload) => {
        const { new: signal } = payload;
        
        if (signal.type === 'offer') {
            // Get caller info
            const { data: caller } = await supabase
                .from('profiles')
                .select('first_name, last_name')
.eq('id', signal.from_user_id)
                .single();

            if (!caller) return;

            setIncomingCall({
                id: signal.id,
                caller: {
                    id: signal.from_user_id,
                    name: `${caller.first_name} ${caller.last_name}`
                },
                signal: signal.offer
            });
        }
    };

    const handleAcceptCall = async () => {
        if (!incomingCall) return;

        try {
            if (userBalance < 1) {
                alert('Insufficient TerriCoin balance');
                return;
            }

            setActiveCall({
                partnerId: incomingCall.caller.id,
                partnerName: incomingCall.caller.name,
                signal: incomingCall.signal
            });

            setIncomingCall(null);
            setActiveTab('feed');

        } catch (error) {
            console.error('Error accepting call:', error);
            alert('Could not accept call. Please try again.');
        }
    };

    const handleDeclineCall = async () => {
        if (!incomingCall) return;

        try {
            await supabase.from('video_signals').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: incomingCall.caller.id,
                type: 'decline'
            });

            setIncomingCall(null);
        } catch (error) {
            console.error('Error declining call:', error);
        }
    };

    const handleCallEnd = async () => {
        try {
            setActiveCall(null);
            await checkBalance(); // Actualizează balanța după apel
        } catch (error) {
            console.error('Error handling call end:', error);
        }
    };

    const handleLowBalance = () => {
        alert('Your TerriCoin balance is low. Please add more coins to continue using video calls.');
    };

    return (
        <div className="container mx-auto p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="feed">
                        <Video className="w-4 h-4 mr-2" />
                        Active Calls
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" />
                        Call History
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                        <Coins className="w-4 h-4 mr-2" />
                        TerriCoin Stats
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="mt-4">
                    {activeCall ? (
                        <VideoChat
                            partnerId={activeCall.partnerId}
                            partnerName={activeCall.partnerName}
                            initialSignal={activeCall.signal}
                            onEnd={handleCallEnd}
                            onLowBalance={handleLowBalance}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-semibold mb-2">
                                No Active Calls
                            </h3>
                            <p className="text-gray-500">
                                Start a call from your matches or wait for incoming calls
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <CallHistory />
                </TabsContent>

                <TabsContent value="stats">
                    <TerriCoinStats 
                        balance={userBalance}
                        onBalanceUpdate={checkBalance}
                    />
                </TabsContent>
            </Tabs>

            {/* Dialog pentru incoming calls */}
            <CallNotification
                isOpen={!!incomingCall}
                caller={incomingCall?.caller}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
            />

            {/* Notificare pentru balanță scăzută */}
            {userBalance < 1 && activeTab === 'feed' && !activeCall && (
                <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p className="font-medium">Low TerriCoin Balance</p>
                    <p className="text-sm">Add more coins to make video calls</p>
                    <Button
                        onClick={() => setActiveTab('stats')}
                        variant="outline"
                        className="mt-2"
                    >
                        Add TerriCoin
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MainFeed;
