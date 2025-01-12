import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

const VideoChat = ({ matchId, partnerId, onEnd }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [balance, setBalance] = useState(0);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        // Verifică balanța la început
        checkBalance();

        // Actualizează durata la fiecare secundă când apelul este activ
        let interval;
        if (isCallActive) {
            interval = setInterval(() => {
                const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(currentDuration);
                
                // Verifică dacă mai sunt suficienți TerriCoin
                if (balance < (Math.floor(currentDuration / 60) + 1)) {
                    endCall();
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCallActive]);

    const checkBalance = async () => {
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .single();
        
        setBalance(wallet?.balance || 0);
    };

    const startCall = async () => {
        try {
            // Verifică dacă sunt suficienți TerriCoin
            if (balance < 1) {
                alert('Trebuie să ai minim 1 TerriCoin pentru a începe un apel video');
                return;
            }

            // Obține acces la camera și microfon
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Afișează video local
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Inițiază apelul
            startTimeRef.current = Date.now();
            setIsCallActive(true);

            // Înregistrează începutul apelului în baza de date
            await supabase.from('messages').insert({
                match_id: matchId,
                sender_id: supabase.auth.user().id,
                receiver_id: partnerId,
                is_video: true,
                start_time: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error starting video call:', error);
            alert('Nu s-a putut iniția apelul video. Verifică accesul la cameră și microfon.');
        }
    };

    const endCall = async () => {
        try {
            // Oprește stream-urile video
            const localStream = localVideoRef.current?.srcObject;
            const remoteStream = remoteVideoRef.current?.srcObject;

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }

            // Actualizează durata apelului în baza de date
            await supabase.from('messages')
                .update({
                    end_time: new Date().toISOString()
                })
                .match({
                    match_id: matchId,
                    is_video: true,
                    end_time: null
                });

            setIsCallActive(false);
            startTimeRef.current = null;
            setDuration(0);

            if (onEnd) onEnd();
        } catch (error) {
            console.error('Error ending video call:', error);
        }
    };

    const toggleMute = () => {
        const stream = localVideoRef.current?.srcObject;
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const calculateCost = (seconds) => {
        return Math.ceil(seconds / 60); // 1 TerriCoin per minut
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full rounded-lg bg-gray-900"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                            Tu
                        </span>
                    </div>
                    <div className="relative">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-lg bg-gray-900"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                            Partener
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4">
                    <div>
                        <p className="text-sm text-gray-600">Durată</p>
                        <p className="text-lg font-bold">{formatDuration(duration)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="text-lg font-bold">{calculateCost(duration)} TerriCoin</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Balanță</p>
                        <p className="text-lg font-bold">{balance} TerriCoin</p>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {!isCallActive ? (
                        <Button
                            onClick={startCall}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Video className="w-5 h-5 mr-2" />
                            Începe Apel
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={toggleMute}
                                variant="outline"
                            >
                                {isMuted ? (
                                    <MicOff className="w-5 h-5" />
                                ) : (
                                    <Mic className="w-5 h-5" />
                                )}
                            </Button>
                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                <PhoneOff className="w-5 h-5 mr-2" />
                                Încheie Apel
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VideoChat;
