// src/services/videoService.js
let peerConnection = null;

export const initializeVideoCall = async (userId, remoteUserId) => {
  try {
    // Configurare WebRTC
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    peerConnection = new RTCPeerConnection(configuration);

    // Obține stream-ul local
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    // Adaugă track-urile la conexiune
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    return {
      success: true,
      localStream,
      peerConnection
    };
  } catch (error) {
    console.error('Error initializing video call:', error);
    return { success: false, error: error.message };
  }
};

export const createOffer = async () => {
  try {
    if (!peerConnection) {
      throw new Error('PeerConnection not initialized');
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    return {
      success: true,
      offer
    };
  } catch (error) {
    console.error('Error creating offer:', error);
    return { success: false, error: error.message };
  }
};

export const handleAnswer = async (answer) => {
  try {
    if (!peerConnection) {
      throw new Error('PeerConnection not initialized');
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    return { success: true };
  } catch (error) {
    console.error('Error handling answer:', error);
    return { success: false, error: error.message };
  }
};

export const endVideoCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
};

export const toggleAudio = (stream, enabled) => {
  stream.getAudioTracks().forEach(track => {
    track.enabled = enabled;
  });
};

export const toggleVideo = (stream, enabled) => {
  stream.getVideoTracks().forEach(track => {
    track.enabled = enabled;
  });
};