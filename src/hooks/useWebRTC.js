import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers here for production
    ],
    iceCandidatePoolSize: 10,
};

const useWebRTC = (roomId, userName) => {
    // Media State
    const [localStream, setLocalStream] = useState(null);
    const [participants, setParticipants] = useState(new Map()); // Map<socketId, { userName, ... }>
    const [remoteStreams, setRemoteStreams] = useState(new Map()); // Map<socketId, MediaStream>

    // UI State
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('initializing'); // initializing, connecting, connected, failed
    const [error, setError] = useState(null);
    const [myUserId, setMyUserId] = useState(null);

    // Refs for mutable state not triggering re-renders
    const peerConnections = useRef(new Map()); // socketId -> RTCPeerConnection
    const localStreamRef = useRef(null);
    const processedOffers = useRef(new Set()); // Deduplication

    // 1. Initialize Local Media
    useEffect(() => {
        const startLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true },
                    video: { width: 1280, height: 720, facingMode: 'user' }
                });

                localStreamRef.current = stream;
                setLocalStream(stream);
                setConnectionStatus('ready_to_join');
            } catch (err) {
                console.error('Media Access Error:', err);
                setError('Could not access camera/microphone');
                setConnectionStatus('failed');
            }
        };

        if (roomId && userName) {
            startLocalStream();
        }

        return () => {
            // Cleanup media on unmount
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId, userName]);

    // 2. Socket Events & WebRTC Logic
    useEffect(() => {
        if (!localStream || !roomId || !userName) return;

        // Initialize Socket
        if (!socket.connected) socket.connect();

        // Join Room
        socket.emit('join-room', { roomId, userName });
        setConnectionStatus('connecting');

        // Handlers
        const handleRoomJoined = ({ userId, participants: existingParticipants }) => {
            console.log(`✅ Joined room as ${userId}`);
            setMyUserId(userId);
            setConnectionStatus('connected');

            // Store existing participants
            const newParticipants = new Map();
            existingParticipants.forEach(p => {
                newParticipants.set(p.socketId, { ...p });
                // We initiate connection to existing peers
                createPeerConnection(p.socketId, true, p.userId);
            });
            setParticipants(newParticipants);
        };

        const handleUserJoined = ({ socketId, userName, userId }) => {
            console.log(`👤 New user joined: ${userName} (${socketId})`);
            setParticipants(prev => new Map(prev).set(socketId, { socketId, userName, userId }));
            // They will initiate, we wait for offer. 
            // OR: Standard mesh pattern often has joiner initiate.
            // Let's stick to: EXISTING participants initiate to NEW joiner to avoid glare, 
            // or NEW joiner initiates to everyone.
            // In 'handleRoomJoined', we initiated to everyone.
            // So here, we just wait.
        };

        const handleUserLeft = ({ socketId }) => {
            console.log(`👋 User left: ${socketId}`);

            // Close PC
            if (peerConnections.current.has(socketId)) {
                peerConnections.current.get(socketId).close();
                peerConnections.current.delete(socketId);
            }

            // Remove State
            setParticipants(prev => {
                const newMap = new Map(prev);
                newMap.delete(socketId);
                return newMap;
            });
            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(socketId);
                return newMap;
            });
        };

        const handleOffer = async ({ offer, senderSocketId, senderId }) => {
            console.log(`📨 Received Offer from ${senderSocketId}`);
            const pc = createPeerConnection(senderSocketId, false, senderId);

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('answer', {
                    targetSocketId: senderSocketId,
                    answer,
                    senderId: myUserId
                });
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        };

        const handleAnswer = async ({ answer, senderSocketId }) => {
            console.log(`📨 Received Answer from ${senderSocketId}`);
            const pc = peerConnections.current.get(senderSocketId);
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error('Error handling answer:', err);
                }
            }
        };

        const handleIceCandidate = async ({ candidate, senderSocketId }) => {
            const pc = peerConnections.current.get(senderSocketId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding ICE:', err);
                }
            }
        };

        const handleMediaToggle = ({ socketId, mediaType, enabled }) => {
            setParticipants(prev => {
                const p = prev.get(socketId);
                if (!p) return prev;
                return new Map(prev).set(socketId, {
                    ...p,
                    [`${mediaType}Enabled`]: enabled
                });
            });
        };

        // --- Helpers ---

        const createPeerConnection = (targetSocketId, isInitiator, targetUserId) => {
            if (peerConnections.current.has(targetSocketId)) {
                console.warn('PC already exists for', targetSocketId);
                return peerConnections.current.get(targetSocketId);
            }

            console.log(`🛠️ Creating PC for ${targetSocketId} (Initiator: ${isInitiator})`);
            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Add local tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current);
                });
            }

            // Remote Track Event
            pc.ontrack = (event) => {
                console.log(`📹 Received Remote Track from ${targetSocketId}`);
                const [remoteStream] = event.streams;
                setRemoteStreams(prev => new Map(prev).set(targetSocketId, remoteStream));
            };

            // ICE Candidate Event
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        targetSocketId,
                        candidate: event.candidate,
                        senderId: myUserId
                    });
                }
            };

            // Cleanup on connection failure
            pc.onconnectionstatechange = () => {
                console.log(`Connection state with ${targetSocketId}: ${pc.connectionState}`);
                if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    // Optional: handle retry or cleanup
                }
            };

            peerConnections.current.set(targetSocketId, pc);

            // If initiator, create offer
            if (isInitiator) {
                (async () => {
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('offer', {
                            targetSocketId,
                            offer,
                            senderId: myUserId
                        });
                    } catch (err) {
                        console.error('Error creating offer:', err);
                    }
                })();
            }

            return pc;
        };

        // Listeners
        socket.on('room-joined', handleRoomJoined);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('user-media-toggle', handleMediaToggle);

        return () => {
            socket.off('room-joined');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('user-media-toggle');

            // Close all PCs
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
            socket.emit('leave-room', { roomId });
        };
    }, [roomId, userName, localStream]);
    // ^ Note: we depend on localStream being ready

    // Controls
    const toggleMic = useCallback(() => {
        if (!localStreamRef.current) return;
        const track = localStreamRef.current.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsAudioEnabled(track.enabled);
            socket.emit('toggle-media', { roomId, mediaType: 'audio', enabled: track.enabled });
        }
    }, [roomId]);

    const toggleCamera = useCallback(() => {
        if (!localStreamRef.current) return;
        const track = localStreamRef.current.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoEnabled(track.enabled);
            socket.emit('toggle-media', { roomId, mediaType: 'video', enabled: track.enabled });
        }
    }, [roomId]);

    const leaveRoom = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        socket.disconnect();
    }, []);

    return {
        localStream,
        remoteStreams,
        participants,
        isAudioEnabled,
        isVideoEnabled,
        isConnecting: connectionStatus === 'connecting' || connectionStatus === 'initializing',
        error,
        userId: myUserId,
        toggleMic,
        toggleCamera,
        leaveRoom
    };
};

export default useWebRTC;
