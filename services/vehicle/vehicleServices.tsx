import api from "@/constants/axiosInstance/axiosInstanceJSON";

// Function to view the user's profile
export const getVehicleAssignments = async () => {
    try {
        const response = await api.get('/user/dispatcher/assignments/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Function to view the user's profile
export const getVehicleAssignmentsById = async (id: string | number) => {
    try {
        const response = await api.get(`/user/dispatcher/assignments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};