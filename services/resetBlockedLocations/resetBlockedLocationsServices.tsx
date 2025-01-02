import api from "@/constants/axiosInstance/axiosInstanceJSON";

// Function to reset blocked locations for all vehicles
export const resetBlockedLocationsForAllVehicles = async () => {
    try {
        const response = await api.post('/api/user/dispatcher/blocked_locations/reset');
        return response.data;
    } catch (error) {
        console.error('Error resetting blocked locations for all vehicles:', error);
        throw error;
    }
};
