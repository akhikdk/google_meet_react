import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, User, ArrowRight, Loader2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Use auth context login
            login({ name: name.trim() });

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if redirecting to a room
            const params = new URLSearchParams(location.search);
            const roomId = params.get('room');

            if (roomId) {
                navigate(`/room/${roomId}`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError('Failed to login. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-meet-dark-900 bg-gradient-mesh flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-meet-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-meet-green-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-meet-blue-500 to-meet-green-500 flex items-center justify-center mx-auto mb-4 shadow-meet-lg">
                        <Video className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Meet<span className="text-meet-blue-400">Clone</span>
                    </h1>
                    <p className="text-meet-dark-400">
                        Premium video conferencing for everyone
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 animate-slide-up">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Welcome!</h2>
                        <p className="text-meet-dark-400 text-sm">
                            Enter your name to get started
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-meet-dark-300 mb-2">
                                Your name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-meet-dark-400" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your display name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-primary pl-12"
                                    autoFocus
                                    maxLength={50}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-meet-red-400 text-sm bg-meet-red-500/10 px-4 py-3 rounded-xl flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-meet-red-400" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Getting ready...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Features */}
                    <div className="mt-8 pt-6 border-t border-meet-dark-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm text-meet-dark-400">
                                <Shield className="w-4 h-4 text-meet-green-400" />
                                <span>Secure calls</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-meet-dark-400">
                                <Sparkles className="w-4 h-4 text-meet-yellow-400" />
                                <span>HD video</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-meet-dark-500 text-sm mt-6">
                    No account required • Join meetings instantly
                </p>
            </div>
        </div>
    );
};

export default Login;
