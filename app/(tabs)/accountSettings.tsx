import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ToastAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Sidebar from "../components/sidebar";
import { getUser, updateAccount } from "@/services/authentication/authServices";
import { viewProfile } from "@/services/profile/profileServices";
import { updateProfileImage, openImagePicker } from "@/services/profile/updateProfile";
import renderImage from "@/constants/renderImage/renderImage";
import FastImage from 'react-native-fast-image';

const accountSettings = () => {
  // State for managing profile data
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  // State to control the visibility of the sidebar
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  
  // State for managing modal visibility (password change)
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        // Fetch profile data
        const profileData = await viewProfile();
        
        const userData = await getUser();
        setUsername(userData.username);
        setEmail(userData.email);
  
        
        console.log("Profile Data:", profileData);  // Log profile data
  
        // Check if the profile image exists in the nested `profile` object
        const userProfileImage = profileData.profile && profileData.profile.user_profile_image;
  
        if (userProfileImage) {
          // Construct the image URL
          const imageUrl = `${renderImage}/${userProfileImage}?v=${new Date().getTime()}`;
          setProfileImage(imageUrl);
          console.log('profile image', imageUrl);
        } else {
          console.log("No profile image found.");
          setProfileImage(null); // Fallback to null if no image
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        ToastAndroid.show("Failed to fetch user data.", ToastAndroid.BOTTOM);
      }
    };
  
    fetchUserData();
  }, []);  // Run only once when the component mounts
  
  // Log when profileImage is updated (useful for debugging)
  useEffect(() => {
    if (profileImage) {
      console.log("Updated profile image URL:", profileImage);
    }
  }, [profileImage]);

  const handleSave = async () => {
    try {
      const updateData = {};
  
      // Check if email is provided and add it to updateData
      if (email) {
        updateData.email = email;
      }
  
      // If no changes were made (empty updateData), alert the user
      if (Object.keys(updateData).length === 0) {
        ToastAndroid.show("No changes were applied.", ToastAndroid.BOTTOM);
        return;
      }
  
      // Update account data using the API
      await updateAccount(updateData);

      ToastAndroid.show("Password updated successfully.", ToastAndroid.BOTTOM);
      console.log("Update Data:", updateData);
    } catch (error) {
      console.error("Error updating account:", error);
      ToastAndroid.show("Email must be unique.", ToastAndroid.BOTTOM);
    }
  };

  const handleDone = async () => {
    try {
      const updateData = {};

      // Check if password and rePassword are provided and match
      if (password && rePassword) {
        if (password !== rePassword) {
          ToastAndroid.show("Passwords do not match.", ToastAndroid.BOTTOM);
          return;
        }
        updateData.password = password;
      }
  
      // If no changes were made (empty updateData), alert the user
      if (Object.keys(updateData).length === 0) {
        ToastAndroid.show("No changes were applied.", ToastAndroid.BOTTOM);
        return;
      }
  
      // Update account data using the API
      await updateAccount(updateData);
  
      ToastAndroid.show("Password updated successfully.", ToastAndroid.BOTTOM);
      setPassword(""); // Clear password fields
      setRePassword("");
      setPasswordModalVisible(false); // Close the password modal
      console.log("Update Data:", updateData);
    } catch (error) {
      console.error("Error updating account:", error);
      ToastAndroid.show("Failed to update account.", ToastAndroid.BOTTOM);
    }
  };
  
  
  const handleCancel = () => {
    setPassword(""); // Clear password fields
    setRePassword("");
    setPasswordModalVisible(false); // Close modal
  };

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleImagePicker = async () => {
    const imageUri = await openImagePicker(setProfileImage); // This should set the URI
    if (imageUri) {
        console.log("Picked Image URI:", imageUri); // Log the URI to check
        await updateProfileImage(imageUri); // Call the update API
        ToastAndroid.show("Profile image updated successfully.", ToastAndroid.BOTTOM);
    } else {
        ToastAndroid.show("No image selected.", ToastAndroid.BOTTOM); // If no image selected
    }
};

  return (
    <View style={styles.container}>
      {/* Sidebar component */}
      <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />

      {/* Profile Edit Section */}
      <ScrollView style={styles.editProfileContainer}>
        <View style={styles.profilePicContainer}>
        <Image
          key={profileImage}
          source={{ uri: profileImage }}
          style={styles.profilePic}
          onError={(e) => {
            console.log("Image loading error:", e.nativeEvent.error);
            setProfileImage(null); // Optionally set fallback image
          }}
        />
          <TouchableOpacity style={styles.editIcon} onPress={handleImagePicker}>
            <Icon name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          editable={false} // Make username non-editable
          style={[styles.inputField, styles.disabledField]}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.inputField}
        />

        {/* Password Change Button */}
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => setPasswordModalVisible(true)} // Open password modal
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        {/* Save and Cancel Buttons */}
        <View style={styles.saveButtonPosition}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.button, styles.saveButton]}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar toggle button */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <Icon name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* Password Change Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />

            <Text style={styles.label}>Re-enter Password</Text>
            <TextInput
              value={rePassword}
              onChangeText={setRePassword}
              secureTextEntry
              style={styles.inputField}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDone}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  editProfileContainer: {
    marginTop: 80, // Adjust for sidebar
    padding: 20,
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00000099",
    padding: 5,
    borderRadius: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 20,
  },
  disabledField: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButtonPosition: {
    alignItems: 'center'
  },
  button: {
    width: "48%",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuButton: {
    position: "absolute",
    top: 30,
    left: 20,
  },
  changePasswordButton: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
  },
  changePasswordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});

export default accountSettings;