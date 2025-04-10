import api from '@/constants/axiosInstance/axiosInstanceFORM';
import * as ImagePicker from 'expo-image-picker';

// Function to update the user's profile image
export const updateProfileImage = async (imageUri: string) => {
    try {
        const formData = new FormData();
        
        // Check if imageUri exists
        if (imageUri) {
            const uriParts = imageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('user_profile_image', {
                uri: imageUri,
                name: `profile_image.${fileType}`,
                type: `image/${fileType}`,
            } as any);

            console.log("FormData:", formData); // Log the formData to check if image is appended correctly
        }

        const response = await api.post('/user/dispatcher/updateProfileImage', formData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
  
export const openImagePicker = async (setProfileImage: (imageUri: string) => void) => {
    // Ask for permission to access the media library
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission granted:", permission.granted); // Log permission status

    if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log("Picker result:", result); // Log the result of the image picker

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            setProfileImage(imageUri); // Set the selected image URI
            return imageUri; // Return the URI to the caller function
        } else {
            console.log("Image picking canceled");
            return null; // Return null if no image was selected
        }
    } else {
        console.log("Permission denied to access media library");
        return null; // Return null if permission is denied
    }
};


