import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Room from './pages/Room';
import { Loader2 } from 'lucide-react';

// Loading Component
const LoadingScreen = () => (
    <div className="min-h-screen bg-meet-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-meet-blue-400 animate-spin" />
            <p className="text-meet-dark-400 text-sm animate-pulse">Loading...</p>
        </div>
    </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route - redirects to home if already logged in
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        // Check if there's a pending room join in the URL query params
        const params = new URLSearchParams(location.search);
        const roomId = params.get('room');
        if (roomId) {
            return <Navigate to={`/room/${roomId}`} replace />; 
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

// Join route - handles meeting link joins
const JoinRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { roomId } = useParams();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to={`/login?room=${roomId}`} replace />;
    }

    return <Room />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/room/:roomId"
                element={<JoinRoute />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-meet-dark-900 bg-gradient-mesh">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
