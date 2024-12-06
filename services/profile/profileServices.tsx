import api from "@/constants/axiosInstance/axiosInstanceJSON";

// Function to view the user's profile
export const viewProfile = async () => {
    try {
        const response = await api.get('/user/profile/view');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Function to delete the user's profile image
export const deleteProfileImage = async (id: string | number) => {
    try {
        const response = await api.delete(`/user/profile/${id}/delete-image`);
        return response.data;
    } catch (error) {
        console.error('Error deleting profile image:', error);
        throw error;
    }
};
