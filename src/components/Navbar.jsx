import { useState } from 'react';
import { Video, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get initials for avatar
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <nav className="border-b border-meet-dark-800 bg-meet-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-meet-blue-500 to-meet-green-500 flex items-center justify-center shadow-meet group-hover:shadow-glow-blue transition-shadow">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-semibold text-white tracking-tight">
                            Meet<span className="text-meet-blue-400">Clone</span>
                        </h1>
                        <p className="text-xs text-meet-dark-400 -mt-0.5">Video Conferencing</p>
                    </div>
                </Link>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <button
                        className="p-2.5 hover:bg-meet-dark-700 rounded-full transition-colors text-meet-dark-300 hover:text-white"
                        aria-label="Help"
                        title="Help"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2.5 hover:bg-meet-dark-700 rounded-full transition-colors text-meet-dark-300 hover:text-white"
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* User menu */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-meet-dark-700 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-meet-blue-500 to-meet-green-500 flex items-center justify-center text-white font-medium text-sm ring-2 ring-transparent hover:ring-meet-blue-400 transition-all">
                                {getInitials(user?.name)}
                            </div>
                        </button>

                        {/* Dropdown menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-12 glass-card p-2 min-w-56 z-50 animate-scale-in">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-meet-dark-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-meet-blue-500 to-meet-green-500 flex items-center justify-center text-white font-medium">
                                                {getInitials(user?.name)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user?.name}</p>
                                                <p className="text-meet-dark-400 text-sm">Guest User</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-2">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-meet-dark-700 rounded-lg transition-colors text-left"
                                        >
                                            <User className="w-5 h-5 text-meet-dark-300" />
                                            <span className="text-white">Profile</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-meet-dark-700 rounded-lg transition-colors text-left text-meet-red-400"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
