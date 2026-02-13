import { X, Mic, MicOff, Video, VideoOff, MoreVertical } from 'lucide-react';

const ParticipantList = ({ participants, localUserName, onClose }) => {
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
            'bg-gradient-to-br from-meet-blue-500 to-meet-blue-700',
            'bg-gradient-to-br from-meet-green-500 to-meet-green-700',
            'bg-gradient-to-br from-meet-red-500 to-meet-red-700',
            'bg-gradient-to-br from-meet-yellow-500 to-meet-yellow-700',
            'bg-gradient-to-br from-purple-500 to-purple-700',
            'bg-gradient-to-br from-pink-500 to-pink-700',
            'bg-gradient-to-br from-indigo-500 to-indigo-700',
            'bg-gradient-to-br from-teal-500 to-teal-700',
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const participantCount = participants.size + 1;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-meet-dark-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    People ({participantCount})
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-meet-dark-700 rounded-full transition-colors"
                    aria-label="Close participants panel"
                >
                    <X className="w-5 h-5 text-meet-dark-400" />
                </button>
            </div>

            {/* Participant list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* Local user (You) */}
                <div className="participant-item group">
                    <div className={`avatar ${getAvatarColor(localUserName)}`}>
                        {getInitials(localUserName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                            {localUserName}
                            <span className="text-meet-dark-400 font-normal ml-2">(You)</span>
                        </p>
                        <p className="text-meet-dark-500 text-sm">Host</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-70">
                        <div className="p-1.5 rounded-full bg-meet-dark-700">
                            <Mic className="w-4 h-4 text-meet-green-400" />
                        </div>
                        <div className="p-1.5 rounded-full bg-meet-dark-700">
                            <Video className="w-4 h-4 text-meet-green-400" />
                        </div>
                    </div>
                </div>

                {/* Remote participants */}
                {Array.from(participants.entries()).map(([socketId, participant]) => (
                    <div key={socketId} className="participant-item group">
                        <div className={`avatar ${getAvatarColor(participant.userName || 'Unknown')}`}>
                            {getInitials(participant.userName || 'Unknown')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                                {participant.userName || 'Participant'}
                            </p>
                            <p className="text-meet-dark-500 text-sm">Participant</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className={`p-1.5 rounded-full ${participant.audioEnabled === false
                                    ? 'bg-meet-red-500/20'
                                    : 'bg-meet-dark-700'
                                }`}>
                                {participant.audioEnabled === false ? (
                                    <MicOff className="w-4 h-4 text-meet-red-400" />
                                ) : (
                                    <Mic className="w-4 h-4 text-meet-green-400" />
                                )}
                            </div>
                            <div className={`p-1.5 rounded-full ${participant.videoEnabled === false
                                    ? 'bg-meet-red-500/20'
                                    : 'bg-meet-dark-700'
                                }`}>
                                {participant.videoEnabled === false ? (
                                    <VideoOff className="w-4 h-4 text-meet-red-400" />
                                ) : (
                                    <Video className="w-4 h-4 text-meet-green-400" />
                                )}
                            </div>
                            <button className="p-1.5 hover:bg-meet-dark-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4 text-meet-dark-300" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer info */}
            <div className="p-4 border-t border-meet-dark-800">
                <div className="text-center">
                    <p className="text-meet-dark-500 text-sm">
                        {participantCount === 1
                            ? 'You are the only one here'
                            : `${participantCount} participants in call`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ParticipantList;
