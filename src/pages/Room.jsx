import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebRTC from '../hooks/useWebRTC';
import VideoTile from '../components/VideoTile';
import Controls from '../components/Controls';
import ParticipantList from '../components/ParticipantList';
import { Users, Info, X, Copy, Check, Loader2, Share2, Link2, Mail, MessageSquare } from 'lucide-react';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [showParticipants, setShowParticipants] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get username from auth context
    const userName = user?.name || sessionStorage.getItem('userName') || 'Guest';

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !sessionStorage.getItem('userName')) {
            navigate(`/login?room=${roomId}`);
        }
    }, [isAuthenticated, navigate, roomId]);

    // WebRTC hook
    const {
        localStream,
        remoteStreams,
        participants,
        isAudioEnabled,
        isVideoEnabled,
        isConnecting,
        error,
        userId,
        toggleMic,
        toggleCamera,
        leaveRoom,
    } = useWebRTC(roomId, userName);

    // Meeting link
    const meetingLink = `${window.location.origin}/room/${roomId}`;

    // Handle leaving the room
    const handleLeave = useCallback(() => {
        leaveRoom();
        navigate('/');
    }, [leaveRoom, navigate]);

    // Copy meeting link
    const copyMeetingLink = async () => {
        try {
            await navigator.clipboard.writeText(meetingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Share via native share API
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my meeting',
                    text: `Join my video meeting on MeetClone`,
                    url: meetingLink,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            setShowShareModal(true);
        }
    };

    // Calculate grid layout based on participant count
    const getGridClass = () => {
        const count = remoteStreams.size + 1; // +1 for local stream
        if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto';
        if (count === 2) return 'grid-cols-1 md:grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
        return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    // Loading state
    if (isConnecting) {
        return (
            <div className="fixed inset-0 bg-meet-dark-900 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="spinner mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Joining meeting...</h2>
                    <p className="text-meet-dark-400 mb-2">Setting up your audio and video</p>
                    <p className="text-meet-dark-500 text-sm font-mono">{roomId}</p>
                    <div className="connecting-dots mt-4 justify-center">
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </div>
        );
    }

    // Error state with share option
    if (error) {
        return (
            <div className="fixed inset-0 bg-meet-dark-900 flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-meet-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-meet-red-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Connection Error</h2>
                    <p className="text-meet-dark-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={handleLeave} className="btn-secondary">
                            Return to Home
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-meet-dark-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-meet-dark-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-white truncate">
                        <span className="hidden sm:inline">Meeting: </span>
                        <span className="text-meet-blue-400 font-mono">{roomId}</span>
                    </h1>

                    {/* Share button */}
                    <button
                        onClick={handleNativeShare}
                        className="flex items-center gap-2 px-3 py-1.5 bg-meet-blue-500/10 hover:bg-meet-blue-500/20 text-meet-blue-400 rounded-full transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Participants toggle */}
                    <button
                        onClick={() => {
                            setShowParticipants(!showParticipants);
                            setShowInfo(false);
                        }}
                        className={`relative p-3 rounded-full transition-all ${showParticipants
                            ? 'bg-meet-blue-500/20 text-meet-blue-400'
                            : 'hover:bg-meet-dark-700 text-meet-dark-300'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-meet-blue-500 text-white text-xs flex items-center justify-center">
                            {participants.size + 1}
                        </span>
                    </button>

                    {/* Info toggle */}
                    <button
                        onClick={() => {
                            setShowInfo(!showInfo);
                            setShowParticipants(false);
                        }}
                        className={`p-3 rounded-full transition-all ${showInfo
                            ? 'bg-meet-blue-500/20 text-meet-blue-400'
                            : 'hover:bg-meet-dark-700 text-meet-dark-300'
                            }`}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video grid */}
                <div className={`flex-1 p-4 overflow-auto transition-all duration-300 ${showParticipants || showInfo ? 'lg:mr-80' : ''
                    }`}>
                    <div className={`grid ${getGridClass()} gap-4 h-full auto-rows-fr`}>
                        {/* Local video tile */}
                        <VideoTile
                            stream={localStream}
                            userName={`${userName} (You)`}
                            isLocal={true}
                            isMuted={!isAudioEnabled}
                            isVideoOff={!isVideoEnabled}
                        />

                        {/* Remote video tiles */}
                        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
                            const participant = participants.get(socketId);
                            return (
                                <VideoTile
                                    key={socketId}
                                    stream={stream}
                                    userName={participant?.userName || 'Participant'}
                                    isLocal={false}
                                    isMuted={participant?.audioEnabled === false}
                                    isVideoOff={participant?.videoEnabled === false}
                                />
                            );
                        })}
                    </div>

                    {/* Empty state - invite others */}
                    {remoteStreams.size === 0 && (
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 glass-card p-4 animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-meet-blue-500/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-meet-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">You're the only one here</p>
                                    <p className="text-meet-dark-400 text-sm">Share the link to invite others</p>
                                </div>
                                <button
                                    onClick={copyMeetingLink}
                                    className="btn-primary py-2 px-4 flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy link
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleNativeShare}
                                    className="btn-secondary py-2 px-4 flex items-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side panels */}
                {(showParticipants || showInfo) && (
                    <div className="hidden lg:block fixed right-0 top-16 bottom-24 w-80 border-l border-meet-dark-800 bg-meet-dark-900/95 backdrop-blur-sm overflow-y-auto z-10 animate-slide-up">
                        {showParticipants && (
                            <ParticipantList
                                participants={participants}
                                localUserName={userName}
                                onClose={() => setShowParticipants(false)}
                            />
                        )}

                        {showInfo && (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-white">Meeting Info</h2>
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="p-2 hover:bg-meet-dark-700 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-meet-dark-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="glass-card p-4">
                                        <p className="text-sm text-meet-dark-400 mb-2">Meeting code</p>
                                        <p className="text-lg font-mono text-white">{roomId}</p>
                                    </div>

                                    <div className="glass-card p-4">
                                        <p className="text-sm text-meet-dark-400 mb-3">Share this meeting</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={meetingLink}
                                                readOnly
                                                className="flex-1 bg-meet-dark-800 text-white text-sm px-3 py-2 rounded-lg truncate"
                                            />
                                            <button
                                                onClick={copyMeetingLink}
                                                className="p-2 hover:bg-meet-dark-700 rounded-lg transition-colors"
                                            >
                                                {copied ? (
                                                    <Check className="w-5 h-5 text-meet-green-400" />
                                                ) : (
                                                    <Copy className="w-5 h-5 text-meet-dark-300" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-meet-dark-500 text-xs">
                                            Share this link with others to invite them to the meeting
                                        </p>
                                    </div>

                                    <div className="glass-card p-4">
                                        <p className="text-sm text-meet-dark-400 mb-2">Your name</p>
                                        <p className="text-white">{userName}</p>
                                    </div>

                                    <div className="glass-card p-4">
                                        <p className="text-sm text-meet-dark-400 mb-2">Participants</p>
                                        <p className="text-white">{participants.size + 1} in this meeting</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls bar */}
            <Controls
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onLeave={handleLeave}
                onShare={handleNativeShare}
                roomId={roomId}
            />

            {/* Mobile side panel overlay */}
            {(showParticipants || showInfo) && (
                <div
                    className="lg:hidden fixed inset-0 bg-meet-dark-950/80 z-40"
                    onClick={() => {
                        setShowParticipants(false);
                        setShowInfo(false);
                    }}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-meet-dark-900 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showParticipants && (
                            <ParticipantList
                                participants={participants}
                                localUserName={userName}
                                onClose={() => setShowParticipants(false)}
                            />
                        )}

                        {showInfo && (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-white">Meeting Info</h2>
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="p-2 hover:bg-meet-dark-700 rounded-full"
                                    >
                                        <X className="w-5 h-5 text-meet-dark-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="glass-card p-4">
                                        <p className="text-sm text-meet-dark-400 mb-2">Meeting code</p>
                                        <p className="text-lg font-mono text-white">{roomId}</p>
                                    </div>

                                    <button
                                        onClick={copyMeetingLink}
                                        className="w-full btn-primary flex items-center justify-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Link Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                Copy meeting link
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleNativeShare}
                                        className="w-full btn-secondary flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Share meeting
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-meet-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 max-w-md w-full animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Share meeting</h2>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-meet-dark-700 rounded-full"
                            >
                                <X className="w-5 h-5 text-meet-dark-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Meeting link */}
                            <div>
                                <label className="block text-sm text-meet-dark-400 mb-2">Meeting link</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={meetingLink}
                                        readOnly
                                        className="flex-1 input-primary text-sm"
                                    />
                                    <button
                                        onClick={copyMeetingLink}
                                        className="btn-primary py-3"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Share options */}
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                <a
                                    href={`mailto:?subject=Join my meeting&body=Join my video meeting: ${meetingLink}`}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-meet-dark-700 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-meet-blue-500/20 flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-meet-blue-400" />
                                    </div>
                                    <span className="text-sm text-meet-dark-300">Email</span>
                                </a>

                                <a
                                    href={`https://wa.me/?text=Join my video meeting: ${encodeURIComponent(meetingLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-meet-dark-700 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-meet-green-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-meet-green-400" />
                                    </div>
                                    <span className="text-sm text-meet-dark-300">WhatsApp</span>
                                </a>

                                <button
                                    onClick={copyMeetingLink}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-meet-dark-700 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-meet-yellow-500/20 flex items-center justify-center">
                                        <Link2 className="w-6 h-6 text-meet-yellow-400" />
                                    </div>
                                    <span className="text-sm text-meet-dark-300">Copy link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
