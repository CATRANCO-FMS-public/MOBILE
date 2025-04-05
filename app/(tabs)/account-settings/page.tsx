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
  ActivityIndicator
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import renderImage from "@/constants/renderImage/renderImage";

import Sidebar from "../../components/layout/Sidebar";

import { getUser, updateAccount } from "@/services/authentication/authServices";
import { viewProfile } from "@/services/profile/profileServices";
import { updateProfileImage, openImagePicker } from "@/services/profile/updateProfile";

interface UpdateData {
  email?: string;
  password?: string;
}

const accountSettings = () => {
  // State for managing profile data
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from AsyncStorage (if available)
        const storedProfileImage = await AsyncStorage.getItem('profileImage');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedEmail = await AsyncStorage.getItem('email');
  
        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }
  
        if (storedUsername) {
          setUsername(storedUsername);
        }
  
        if (storedEmail) {
          setEmail(storedEmail);  // Set email from AsyncStorage
        } else {
          // Fetch fresh data if not found in AsyncStorage
          const profileData = await viewProfile();
          const userData = await getUser();
          
          console.log("User Data:", userData); // Log user data
          
          setUsername(userData.username);
          setEmail(userData.email);  // Set email from fresh data
  
          const userProfileImage = profileData.profile && profileData.profile.user_profile_image;
          if (userProfileImage) {
            const imageUrl = `${renderImage}/${userProfileImage}?v=${new Date().getTime()}`;
            setProfileImage(imageUrl);
            await AsyncStorage.setItem('profileImage', imageUrl); // Store in AsyncStorage
          } else {
            setProfileImage(null);
          }
  
          // Store username, email, and profile image in AsyncStorage for next use
          await AsyncStorage.setItem('username', userData.username);
          await AsyncStorage.setItem('email', userData.email);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        ToastAndroid.show("Add your email", ToastAndroid.BOTTOM);
      }
    };
  
    fetchUserData();
  }, []);  
  
  
  // Log when profileImage is updated (useful for debugging)
  useEffect(() => {
    if (profileImage) {
      console.log("Updated profile image URL:", profileImage);
    }
  }, [profileImage]);


  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: UpdateData = {};
      
      if (email) {
        updateData.email = email;
        await AsyncStorage.setItem('email', email);
      }

      if (Object.keys(updateData).length === 0) {
        ToastAndroid.show("No changes were applied.", ToastAndroid.BOTTOM);
        return;
      }

      await updateAccount(updateData);
      ToastAndroid.show("Account updated successfully.", ToastAndroid.BOTTOM);
    } catch (error) {
      console.error("Error updating account:", error);
      ToastAndroid.show("Error updating account.", ToastAndroid.BOTTOM);
    } finally {
      setLoading(false);
    }
  };

  
  const handleDone = async () => {

    setLoading(true);
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
    } finally {
      setLoading(false);
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
    const imageUri = await openImagePicker(setProfileImage);
    if (imageUri) {
      await updateProfileImage(imageUri);
      await AsyncStorage.setItem('profileImage', imageUri); // Store new image in AsyncStorage
      ToastAndroid.show("Profile image updated successfully.", ToastAndroid.BOTTOM);
    } else {
      ToastAndroid.show("No image selected.", ToastAndroid.BOTTOM);
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
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar toggle button */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <Icon name="menu" size={25} color="black" />
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
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
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
    padding: 25,
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
    top: 20,
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