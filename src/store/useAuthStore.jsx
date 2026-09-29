import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

const useAuthStore = create((set) => ({
    // Initial state local storage se load hogi taaki refresh par login na hate
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    // Login Action
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { user, token } = response.data;

            // Browser storage mein save karein
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token, isAuthenticated: true, isLoading: false });
            
            // UI mein role-based redirect ke liye success aur role return karein
            return { success: true, role: user.role };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Login failed. Please check credentials.', 
                isLoading: false 
            });
            return { success: false };
        }
    },


    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/auth/register', userData);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true, role: user.role };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Registration failed.', 
                isLoading: false 
            });
            return { success: false };
        }
    },


    // Logout Action
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, error: null });
    },
    
    // Error clear karne ke liye helper
    clearError: () => set({ error: null })
}));

export default useAuthStore;