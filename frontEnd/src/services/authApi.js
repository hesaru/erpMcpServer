import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8090'}/api`;

/**
 * Get the stored JWT token
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Get auth headers for API calls
 */
export const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Create an axios instance with auth headers
 */
export const authAxios = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to every request automatically
authAxios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Redirect to login on 401
authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const authApi = {
    /**
     * Login with username and password
     */
    login: async (username, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username,
            password,
        });
        return response.data;
    },

    /**
     * Register a new user (admin only)
     */
    register: async (userData) => {
        const response = await authAxios.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await authAxios.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    /**
     * Get all users (admin only)
     */
    getAllUsers: async () => {
        const response = await authAxios.get('/auth/users');
        return response.data;
    },

    /**
     * Get current user info
     */
    getCurrentUser: async () => {
        const response = await authAxios.get('/auth/me');
        return response.data;
    },
};

export default authApi;
