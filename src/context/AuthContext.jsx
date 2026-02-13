import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('meetUser');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('meetUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        const user = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: userData.name,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('meetUser', JSON.stringify(user));
        sessionStorage.setItem('userName', user.name);
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('meetUser');
        sessionStorage.removeItem('userName');
        setUser(null);
    };

    const updateName = (newName) => {
        if (user) {
            const updatedUser = { ...user, name: newName };
            localStorage.setItem('meetUser', JSON.stringify(updatedUser));
            sessionStorage.setItem('userName', newName);
            setUser(updatedUser);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateName
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
