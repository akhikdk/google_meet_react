import { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, User, Pin, PinOff } from 'lucide-react';

const VideoTile = ({
    stream,
    userName,
    isLocal = false,
    isMuted = false,
    isVideoOff = false,
    isPinned = false,
    onPin,
}) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent color for avatar based on name
    const getAvatarColor = (name) => {
        const colors = [
            'from-meet-blue-500 to-meet-blue-700',
            'from-meet-green-500 to-meet-green-700',
            'from-meet-red-500 to-meet-red-700',
            'from-meet-yellow-500 to-meet-yellow-700',
            'from-purple-500 to-purple-700',
            'from-pink-500 to-pink-700',
            'from-indigo-500 to-indigo-700',
            'from-teal-500 to-teal-700',
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const hasVideo = stream && stream.getVideoTracks().length > 0 && !isVideoOff;

    return (
        <div
            className={`video-tile relative aspect-video ${isPinned ? 'ring-2 ring-meet-blue-500' : ''
                } ${isLocal ? 'ring-1 ring-meet-green-500/30' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''
                    } ${hasVideo ? 'visible' : 'invisible absolute'}`}
            />

            {/* Avatar fallback when video is off */}
            {!hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-meet-dark-800 to-meet-dark-900">
                    <div
                        className={`avatar-lg bg-gradient-to-br ${getAvatarColor(userName)}`}
                    >
                        {getInitials(userName)}
                    </div>
                </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Name and status overlay */}
            <div className="name-overlay">
                <span className="truncate max-w-[150px]">{userName}</span>

                {/* Mic status indicator */}
                {isMuted ? (
                    <div className="w-6 h-6 rounded-full bg-meet-red-500/80 flex items-center justify-center">
                        <MicOff className="w-3.5 h-3.5 text-white" />
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-meet-dark-700/80 flex items-center justify-center">
                        <Mic className="w-3.5 h-3.5 text-meet-green-400" />
                    </div>
                )}
            </div>

            {/* Video off indicator */}
            {isVideoOff && hasVideo && (
                <div className="absolute top-2 right-2 p-1.5 bg-meet-dark-800/80 rounded-lg">
                    <VideoOff className="w-4 h-4 text-meet-dark-400" />
                </div>
            )}

            {/* Hover controls */}
            {isHovered && onPin && (
                <div className="absolute top-2 right-2 flex gap-2 animate-fade-in">
                    <button
                        onClick={onPin}
                        className="p-2 bg-meet-dark-800/90 hover:bg-meet-dark-700 rounded-lg transition-colors"
                        title={isPinned ? 'Unpin' : 'Pin'}
                    >
                        {isPinned ? (
                            <PinOff className="w-4 h-4 text-meet-blue-400" />
                        ) : (
                            <Pin className="w-4 h-4 text-meet-dark-300" />
                        )}
                    </button>
                </div>
            )}

            {/* Local indicator badge */}
            {isLocal && (
                <div className="absolute top-2 left-2">
                    <div className="px-2 py-1 bg-meet-green-500/80 text-white text-xs font-medium rounded-full">
                        You
                    </div>
                </div>
            )}

            {/* Connection quality indicator (placeholder) */}
            {!isLocal && (
                <div className="absolute top-2 left-2 flex gap-0.5">
                    <div className="w-1 h-2 bg-meet-green-500 rounded-full" />
                    <div className="w-1 h-3 bg-meet-green-500 rounded-full" />
                    <div className="w-1 h-4 bg-meet-green-500 rounded-full" />
                </div>
            )}
        </div>
    );
};

export default VideoTile;
