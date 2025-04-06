import api from "@/constants/axiosInstance/axiosInstanceJSON";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to register a new user
export const signup = async (userData: any) => {
    try {
        await api.post('/user/register', userData);
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

// Function to log in a user and store their token
export const login = async (username: string, password: string) => {
    try {
        const response = await api.post('/user/login', { username, password });
        const { token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Function to request a password reset
export const resetPassword = async (email: string) => {
    try {
        const response = await api.post('/user/password/forgot', { email });
        return response.data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};

// Function to retrieve the logged-in user's details
export const getUser = async () => {
    try {
        const response = await api.get('/user/me');
        return response.data;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

// Function to update the logged-in user's account details
export const updateAccount = async (userData: any) => {
    try {
        await api.patch('/user/update', userData);
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
};

// Function to log out the user and remove their token
export const logout = async () => {
    try {
        await api.post('/user/logout');
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};
