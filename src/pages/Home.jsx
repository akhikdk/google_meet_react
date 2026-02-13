import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Mic,
  MicOff,
  VideoOff,
  Calendar,
  Clock,
  Lock,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const generateRoomId = () => crypto.randomUUID().slice(0, 12);

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'pending',
    mic: 'pending'
  });

  const [meetingPassword, setMeetingPassword] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  const [recentMeetings, setRecentMeetings] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* ---------------- CAMERA PREVIEW ---------------- */

  useEffect(() => {
    const initPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn,
          audio: micOn
        });

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        setPermissionStatus({ camera: 'granted', mic: 'granted' });
      } catch {
        setPermissionStatus({ camera: 'denied', mic: 'denied' });
      }
    };

    initPreview();

    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [cameraOn, micOn]);

  /* ---------------- RECENT MEETINGS ---------------- */

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentMeetings')) || [];
    setRecentMeetings(saved);
  }, []);

  const saveRecentMeeting = (meeting) => {
    const updated = [meeting, ...recentMeetings].slice(0, 5);
    setRecentMeetings(updated);
    localStorage.setItem('recentMeetings', JSON.stringify(updated));
  };

  /* ---------------- CREATE MEETING ---------------- */

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    setError('');

    try {
      const roomId = generateRoomId();
      const link = `${window.location.origin}/room/${roomId}`;

      const meetingData = {
        id: roomId,
        link,
        password: meetingPassword,
        scheduledFor: scheduleDate,
        createdAt: new Date().toISOString()
      };

      setNewMeeting(meetingData);
      saveRecentMeeting(meetingData);
      setShowModal(true);
    } catch {
      setError('Failed to create meeting.');
    } finally {
      setIsCreating(false);
    }
  };

  /* ---------------- JOIN ---------------- */

  const handleJoinMeeting = () => {
    if (!roomCode.trim()) return;

    let roomId = roomCode.trim();
    if (roomId.includes('/room/'))
      roomId = roomId.split('/room/')[1].split('?')[0];

    roomId = roomId.replace(/[^a-zA-Z0-9-]/g, '');

    navigate(`/room/${roomId}`);
  };

  /* ---------------- COPY ---------------- */

  const copyLink = async () => {
    await navigator.clipboard.writeText(newMeeting.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ---------------- START NOW ---------------- */

  const startMeetingNow = () => {
    sessionStorage.setItem('userName', user?.name || 'Guest');
    sessionStorage.setItem('meetingPassword', meetingPassword || '');
    navigate(`/room/${newMeeting.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      <Navbar />

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">

        {/* LEFT SIDE */}
        <div className="space-y-8">

          <h1 className="text-5xl font-bold leading-tight">
            Elevate your meetings.
            <span className="text-blue-500"> Zero friction.</span>
          </h1>

          {/* PREVIEW */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-black/40">
                <VideoOff size={40} />
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-sm">
              {user?.name || 'Guest'}
            </div>
          </div>

          {/* TOGGLES */}
          <div className="flex gap-4">
            <button onClick={() => setCameraOn(!cameraOn)} className="btn-toggle">
              {cameraOn ? <Camera /> : <VideoOff />}
            </button>

            <button onClick={() => setMicOn(!micOn)} className="btn-toggle">
              {micOn ? <Mic /> : <MicOff />}
            </button>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <Shield size={16} />
              Cam: {permissionStatus.camera}
            </div>
          </div>

          {/* CREATE CARD */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4">

            <input
              type="text"
              placeholder="Optional meeting password"
              value={meetingPassword}
              onChange={(e) => setMeetingPassword(e.target.value)}
              className="input-primary"
            />

            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="input-primary"
            />

            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {isCreating ? <Loader2 className="animate-spin" /> : <Video />}
              Create Meeting
            </button>

          </div>

          {/* JOIN */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter meeting code or link"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="input-primary flex-1"
            />
            <button onClick={handleJoinMeeting} className="btn-secondary">
              Join <ArrowRight size={16} />
            </button>
          </div>

          {/* RECENT MEETINGS */}
          {recentMeetings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Recent Meetings</h3>
              {recentMeetings.map((m) => (
                <div key={m.id}
                  className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-sm">{m.id}</span>
                  <button
                    onClick={() => navigate(`/room/${m.id}`)}
                    className="text-blue-400 text-sm"
                  >
                    Rejoin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-white/10 space-y-4 w-full max-w-md">
            <h2 className="text-xl font-semibold">Meeting Ready 🎉</h2>

            <div className="bg-black/40 p-3 rounded-lg flex justify-between items-center">
              <span className="text-sm truncate">{newMeeting.link}</span>
              <button onClick={copyLink}>
                {copied ? <Check /> : <Copy />}
              </button>
            </div>

            {newMeeting.password && (
              <p className="text-sm opacity-70">
                Password: <strong>{newMeeting.password}</strong>
              </p>
            )}

            {newMeeting.scheduledFor && (
              <p className="text-sm opacity-70">
                Scheduled: {new Date(newMeeting.scheduledFor).toLocaleString()}
              </p>
            )}

            <button onClick={startMeetingNow} className="btn-primary w-full">
              Start Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
