import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

const VideoChat = ({ matchId, partnerId, onEnd }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [balance, setBalance] = useState(0);
    const [isInitiator, setIsInitiator] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        checkBalance();
        setupSignalingListener();

        return () => {
            cleanupWebRTC();
        };
    }, []);

    const setupSignalingListener = () => {
        const subscription = supabase
            .channel('video_signals')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'video_signals',
                filter: `to_user_id=eq.${supabase.auth.user().id}`
            }, handleSignalingMessage)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const handleSignalingMessage = async (payload) => {
        const { type, from_user_id, offer, answer, ice_candidate } = payload.new;

        if (from_user_id === partnerId) {
            switch (type) {
                case 'offer':
                    await handleOffer(offer);
                    break;
                case 'answer':
                    await handleAnswer(answer);
                    break;
                case 'ice_candidate':
                    await handleIceCandidate(ice_candidate);
                    break;
            }
        }
    };

    const initializePeerConnection = () => {
        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

        peerConnectionRef.current.onicecandidate = ({ candidate }) => {
            if (candidate) {
                sendIceCandidate(candidate);
            }
        };

        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Adaugă stream-ul local la conexiune
        localStreamRef.current.getTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });
    };

    const startCall = async () => {
        try {
            if (balance < 1) {
                alert('Trebuie să ai minim 1 TerriCoin pentru a începe un apel video');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            localVideoRef.current.srcObject = stream;

            setIsInitiator(true);
            initializePeerConnection();

            // Creează și trimite oferta
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            await supabase.from('video_signals').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: partnerId,
                type: 'offer',
                offer
            });

            startTimeRef.current = Date.now();
            setIsCallActive(true);

        } catch (error) {
            console.error('Error starting call:', error);
            alert('Nu s-a putut iniția apelul video.');
        }
    };

    const handleOffer = async (offer) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            localVideoRef.current.srcObject = stream;

            initializePeerConnection();

            await peerConnectionRef.current.setRemoteDescription(offer);
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            await supabase.from('video_signals').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: partnerId,
                type: 'answer',
                answer
            });

            setIsCallActive(true);
            startTimeRef.current = Date.now();

        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const handleAnswer = async (answer) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (candidate) => {
        try {
            await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const sendIceCandidate = async (candidate) => {
        try {
            await supabase.from('video_signals').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: partnerId,
                type: 'ice_candidate',
                ice_candidate: candidate
            });
        } catch (error) {
            console.error('Error sending ICE candidate:', error);
        }
    };

    const endCall = async () => {
        try {
            cleanupWebRTC();
            setIsCallActive(false);
            startTimeRef.current = null;
            setDuration(0);

            await supabase.from('messages').insert({
                match_id: matchId,
                sender_id: supabase.auth.user().id,
                receiver_id: partnerId,
                is_video: true,
                end_time: new Date().toISOString(),
                duration: duration
            });

            if (onEnd) onEnd();
        } catch (error) {
            console.error('Error ending call:', error);
        }
    };

    const cleanupWebRTC = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    // ... restul codului (toggleMute, formatDuration, calculateCost, render) rămâne la fel

    return (
        <Card className="w-full max-w-2xl mx-auto">
            {/* ... același JSX ca înainte */}
        </Card>
    );
};

export default VideoChat;
