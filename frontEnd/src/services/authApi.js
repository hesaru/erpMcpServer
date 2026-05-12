import axios from 'axios';
import { getMcpClientBase } from '../config/apiConfig';

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
// Create instance without baseURL - it's set dynamically per-request
// so that getMcpClientBase() is only called after loadConfig() resolves.
export const authAxios = axios.create({});

// Add token + dynamic baseURL to every request
authAxios.interceptors.request.use(
    (config) => {
        config.baseURL = getMcpClientBase();   // set after loadConfig() resolves
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
        const response = await axios.post(`${getMcpClientBase()}/auth/login`, {
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

    /**
     * Delete a user and linked employee (admin only)
     */
    deleteUser: async (userId) => {
        const response = await authAxios.delete(`/auth/users/${userId}`);
        return response.data;
    },

    /**
     * Update a user's profile (admin only)
     */
    updateUser: async (userId, userData) => {
        const response = await authAxios.put(`/auth/users/${userId}`, userData);
        return response.data;
    },

    /**
     * Reset a user's password (admin only)
     */
    resetPassword: async (userId, newPassword) => {
        const response = await authAxios.post(`/auth/users/${userId}/reset-password`, { newPassword });
        return response.data;
    },
};

export default authApi;
