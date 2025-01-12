import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Phone, PhoneOff, Mic, MicOff, Monitor } from 'lucide-react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

const VideoChat = ({ matchId, partnerId, onEnd }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [balance, setBalance] = useState(0);
    const [isInitiator, setIsInitiator] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        checkBalance();
        setupSignalingListener();
        
        // Timer pentru durata apelului
        let timer;
        if (isCallActive) {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }

        return () => {
            cleanupWebRTC();
            if (timer) clearInterval(timer);
        };
    }, [isCallActive]);

    const checkBalance = async () => {
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .single();
        setBalance(wallet?.balance || 0);
    };

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

        return () => subscription.unsubscribe();
    };

    const handleSignalingMessage = async (payload) => {
        if (!peerConnectionRef.current) return;

        const { type, data } = payload.new;
        
        switch (type) {
            case 'offer':
                await handleOffer(data);
                break;
            case 'answer':
                await handleAnswer(data);
                break;
            case 'ice-candidate':
                await handleIceCandidate(data);
                break;
        }
    };

    const startCall = async () => {
        try {
            if (balance < 1) {
                alert('Insufficient TerriCoin balance');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setIsInitiator(true);
            await initializePeerConnection();

            startTimeRef.current = Date.now();
            setIsCallActive(true);

        } catch (error) {
            console.error('Error starting call:', error);
            alert('Could not start video call. Please check camera permissions.');
        }
    };

    const initializePeerConnection = async () => {
        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

        // Add tracks to the peer connection
        localStreamRef.current.getTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });

        // Handle incoming tracks
        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal('ice-candidate', event.candidate);
            }
        };

        if (isInitiator) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            sendSignal('offer', offer);
        }
    };

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            
            screenStreamRef.current = screenStream;

            // Replace the video track
            const videoTrack = screenStream.getVideoTracks()[0];
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(sender => 
                sender.track.kind === 'video'
            );
            
            await videoSender.replaceTrack(videoTrack);

            // Update local preview
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            setIsScreenSharing(true);

            // Listen for the end of screen sharing
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    const stopScreenShare = async () => {
        try {
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }

            // Switch back to camera
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(sender => 
                sender.track.kind === 'video'
            );
            
            await videoSender.replaceTrack(videoTrack);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }

            setIsScreenSharing(false);
        } catch (error) {
            console.error('Error stopping screen share:', error);
        }
    };

    const sendSignal = async (type, data) => {
        try {
            await supabase.from('video_signals').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: partnerId,
                type,
                data
            });
        } catch (error) {
            console.error('Error sending signal:', error);
        }
    };

    const handleOffer = async (offer) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            sendSignal('answer', answer);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const handleAnswer = async (answer) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (candidate) => {
        try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const toggleMute = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!isMuted);
        }
    };

    const endCall = async () => {
        try {
            const endTime = Date.now();
            const durationMinutes = Math.ceil((endTime - startTimeRef.current) / 60000);
            const cost = durationMinutes;

            await supabase.from('transactions').insert({
                from_user_id: supabase.auth.user().id,
                to_user_id: partnerId,
                amount: cost,
                type: 'video_call'
            });

            cleanupWebRTC();
            setIsCallActive(false);
            if (onEnd) onEnd();
        } catch (error) {
            console.error('Error ending call:', error);
        }
    };

    const cleanupWebRTC = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                            className="w-full aspect-video bg-gray-900 rounded-lg"
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
                            className="w-full aspect-video bg-gray-900 rounded-lg"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                            Partener
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Durată</p>
                        <p className="text-lg font-bold">{formatDuration(duration)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="text-lg font-bold">{Math.ceil(duration / 60)} TC</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Balanță</p>
                        <p className="text-lg font-bold">{balance} TC</p>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {!isCallActive ? (
                        <Button
                            onClick={startCall}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            Start Call
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={toggleMute}
                                variant="outline"
                            >
                                {isMuted ? <MicOff /> : <Mic />}
                            </Button>

                            <Button
                                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                                variant="outline"
                            >
                                <Monitor className="w-5 h-5" />
                            </Button>

                            <Button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                <PhoneOff className="w-5 h-5 mr-2" />
                                End Call
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VideoChat;
