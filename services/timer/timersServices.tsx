import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiURL from '../../constants/apiURL/apiURL';

const api = axios.create({
    baseURL: `${apiURL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
});

// Function to fetch paginated timers
export const getAllTimers = async (perPage = 1, page = 1) => {
    try {
        const response = await api.get('/user/dispatcher/timers/all', {
            params: {
                per_page: perPage,
                page: page,
            },
        });
        return response.data; // Includes timers and metadata
    } catch (error) {
        console.error('Error fetching timers:', error);
        throw error;
    }
};

// Function to fetch a specific timer by ID
export const getTimerById = async (id: string | number) => {
    try {
        const response = await api.get(`/user/dispatcher/timers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching timer with ID ${id}:`, error); 
        throw error;
    }
};

// Function to create a new timer
export const createTimer = async (timerData: Record<string, any>) => {
    try {
        const response = await api.post('/user/dispatcher/timers/create', timerData); 
        return response.data;
    } catch (error) {
        console.error('Error creating timer:', error); 
        throw error;
    }
};

// Function to update an existing timer by ID
export const updateTimer = async (id: string | number, timerData: Record<string, any>) => {
    try {
        const response = await api.patch(`/user/dispatcher/timers/update/${id}`, timerData); 
        return response.data;
    } catch (error) {
        console.error(`Error updating timer with ID ${id}:`, error);
        throw error;
    }
};

// Function to delete a timer by ID
export const deleteTimer = async (id: string | number) => {
    try {
        const response = await api.delete(`/user/dispatcher/timers/delete/${id}`); 
        return response.data;
    } catch (error) {
        console.error(`Error deleting timer with ID ${id}:`, error);
        throw error;
    }
};
