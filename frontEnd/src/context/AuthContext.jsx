import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/authApi';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await authApi.login(username, password);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            username: response.username,
            role: response.role,
            mustChangePassword: response.mustChangePassword,
            employeeId: response.employeeId,
            fullName: response.fullName,
        }));

        setUser({
            username: response.username,
            role: response.role,
            mustChangePassword: response.mustChangePassword,
            employeeId: response.employeeId,
            fullName: response.fullName,
        });

        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedFields) => {
        const newUser = { ...user, ...updatedFields };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isManager = () => user?.role === 'MANAGER';
    const isEmployee = () => user?.role === 'EMPLOYEE';
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                updateUser,
                isAdmin,
                isManager,
                isEmployee,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
