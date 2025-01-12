import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import CallNotification from './CallNotification';
import CallHistory from './CallHistory';
import VideoChat from './VideoChat';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, History } from 'lucide-react';

const MainFeed = () => {
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [activeTab, setActiveTab] = useState('feed');

    useEffect(() => {
        // Subscribă la notificări pentru apeluri video
        const subscription = supabase
            .channel('video_signals')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'video_signals',
                filter: `to_user_id=eq.${supabase.auth.user().id}`
            }, handleVideoSignal)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleVideoSignal = async (payload) => {
        const { new: signal } = payload;
        
        if (signal.type === 'offer') {
            // Obține informații despre apelant
            const { data: caller } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', signal.from_user_id)
                .single();

            setIncomingCall({
                id: signal.id,
                caller: {
                    id: signal.from_user_id,
                    name: `${caller.first_name} ${caller.last_name}`
                }
            });
        }
    };

    const handleAcceptCall = async () => {
        if (!incomingCall) return;

        setActiveCall({
            partnerId: incomingCall.caller.id,
            partnerName: incomingCall.caller.name
        });
        setIncomingCall(null);
    };

    const handleDeclineCall = async () => {
        if (!incomingCall) return;

        // Trimite semnal de respingere
        await supabase.from('video_signals').insert({
            from_user_id: supabase.auth.user().id,
            to_user_id: incomingCall.caller.id,
            type: 'decline'
        });

        setIncomingCall(null);
    };

    const handleCallEnd = () => {
        setActiveCall(null);
    };

    return (
        <div className="container mx-auto p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="feed">
                        <Video className="w-4 h-4 mr-2" />
                        Apeluri Active
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" />
                        Istoric Apeluri
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feed">
                    {activeCall ? (
                        <VideoChat
                            partnerId={activeCall.partnerId}
                            partnerName={activeCall.partnerName}
                            onEnd={handleCallEnd}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Nu există apeluri active în acest moment
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <CallHistory />
                </TabsContent>
            </Tabs>

            <CallNotification
                isOpen={!!incomingCall}
                caller={incomingCall?.caller}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
            />
        </div>
    );
};

export default MainFeed;
