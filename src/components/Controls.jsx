import { useState } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    ScreenShare,
    MoreVertical,
    Copy,
    Check,
    Settings,
    Share2,
} from 'lucide-react';

const Controls = ({
    isAudioEnabled,
    isVideoEnabled,
    onToggleMic,
    onToggleCamera,
    onLeave,
    onScreenShare,
    onShare,
    roomId,
}) => {
    const [showMore, setShowMore] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyMeetingCode = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="h-24 bg-meet-dark-900/95 backdrop-blur-sm border-t border-meet-dark-800 flex items-center justify-center px-4 flex-shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Mic toggle */}
                <div className="relative group">
                    <button
                        onClick={onToggleMic}
                        className={`${isAudioEnabled ? 'control-btn-default' : 'control-btn-muted'
                            }`}
                        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        {isAudioEnabled ? (
                            <Mic className="w-6 h-6" />
                        ) : (
                            <MicOff className="w-6 h-6" />
                        )}
                    </button>
                    <span className="tooltip">
                        {isAudioEnabled ? 'Turn off mic' : 'Turn on mic'}
                    </span>
                </div>

                {/* Camera toggle */}
                <div className="relative group">
                    <button
                        onClick={onToggleCamera}
                        className={`${isVideoEnabled ? 'control-btn-default' : 'control-btn-muted'
                            }`}
                        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoEnabled ? (
                            <Video className="w-6 h-6" />
                        ) : (
                            <VideoOff className="w-6 h-6" />
                        )}
                    </button>
                    <span className="tooltip">
                        {isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    </span>
                </div>

                {/* Share button - mobile */}
                <div className="relative group md:hidden">
                    <button
                        onClick={onShare}
                        className="control-btn-default"
                        aria-label="Share meeting"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                    <span className="tooltip">Share</span>
                </div>

                {/* Screen share (placeholder - requires additional implementation) */}
                <div className="relative group hidden md:block">
                    <button
                        onClick={onScreenShare}
                        className="control-btn-default opacity-50 cursor-not-allowed"
                        disabled
                        aria-label="Share screen"
                    >
                        <ScreenShare className="w-6 h-6" />
                    </button>
                    <span className="tooltip">Coming soon</span>
                </div>

                {/* More options */}
                <div className="relative group hidden md:block">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="control-btn-default"
                        aria-label="More options"
                    >
                        <MoreVertical className="w-6 h-6" />
                    </button>
                    <span className="tooltip">More options</span>

                    {/* Dropdown menu */}
                    {showMore && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMore(false)}
                            />
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 glass-card p-2 min-w-48 z-50 animate-scale-in">
                                <button
                                    onClick={() => {
                                        copyMeetingCode();
                                        setShowMore(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-meet-dark-700 rounded-lg transition-colors text-left"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-meet-green-400" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-meet-dark-300" />
                                    )}
                                    <span className="text-white">
                                        {copied ? 'Copied!' : 'Copy meeting link'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        onShare?.();
                                        setShowMore(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-meet-dark-700 rounded-lg transition-colors text-left"
                                >
                                    <Share2 className="w-5 h-5 text-meet-dark-300" />
                                    <span className="text-white">Share meeting</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-meet-dark-700 rounded-lg transition-colors text-left opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    <Settings className="w-5 h-5 text-meet-dark-300" />
                                    <span className="text-white">Settings</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Leave call button */}
                <div className="relative group ml-4">
                    <button
                        onClick={onLeave}
                        className="control-btn-danger px-8"
                        aria-label="Leave call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                    <span className="tooltip">Leave call</span>
                </div>
            </div>

            {/* Meeting ID display (desktop) */}
            <div className="absolute left-4 hidden md:flex items-center gap-2 text-meet-dark-400">
                <span className="text-sm font-mono">{roomId}</span>
                <button
                    onClick={copyMeetingCode}
                    className="p-1.5 hover:bg-meet-dark-700 rounded-lg transition-colors"
                    title="Copy meeting link"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-meet-green-400" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Current time display */}
            <div className="absolute right-4 hidden md:block text-meet-dark-400 text-sm">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};

export default Controls;
