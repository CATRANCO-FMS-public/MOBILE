import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { logout } from "@/services/authentication/authServices";
import { viewProfile } from "@/services/profile/profileServices";
import renderImage from "@/constants/renderImage/renderImage";

const Sidebar = ({ isVisible, onClose }) => {

  const [profile, setProfile] = useState(null);
  const router = useRouter();

  // Fetch profile data when the sidebar is visible
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await viewProfile(); // Call viewProfile function
        setProfile(profileData); // Store the profile data in the state
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isVisible) {
      fetchProfile(); // Fetch profile data when the sidebar is visible
    }
  }, [isVisible]); // Re-fetch profile data when the sidebar visibility changes

  const handleLogout = async () => {
    try {
      await logout(); 
      router.push("/auth/login");
      console.log('Sucessfully Logged Out');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {isVisible && (
        <View style={styles.sidebarContainer}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close-outline" size={30} color="black" />
          </TouchableOpacity>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Display Profile Image or Frame if Image is not available */}
            {profile?.profile?.user_profile_image ? (
              <Image
                source={{ uri: `${renderImage}/${profile.profile.user_profile_image}` }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imageFrame}>
                <Icon name="person-circle-outline" size={50} color="gray" />
              </View>
            )}
            <Text style={styles.profileName}>
              {profile?.user?.username || "User"}
            </Text>
          </View>

          {/* Menu Options */}
          <View style={styles.menuOptions}>
            {/* Dispatch Management Link */}
            <Link href="/(tabs)/dispatch" style={styles.menuItem}>
              <Text style={styles.menuText}>Dispatch Management</Text>
            </Link>
            {/* Dispatch Setting Link */}
            <Link href="/(tabs)/DispatchSettings" style={styles.menuItem}>
              <Text style={styles.menuText}>Dispatch Setting</Text>
            </Link>

            {/* Profile Settings Link */}
            <Link href="/(tabs)/accountSettings" style={styles.menuItem}>
              <Text style={styles.menuText}>Account Settings</Text>
            </Link>

            {/* Logout Button */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: "absolute", // Make the sidebar absolute to stay on top
    top: 0, // Ensure it starts from the top of the screen
    left: 0, // Align to the left
    width: Dimensions.get("window").width * 0.6, // Set sidebar width (60% of screen)
    height: "110%", // Make it span the full height of the screen
    backgroundColor: "#f5f5f5", // Sidebar background color
    zIndex: 1000, // Ensure it stays on top of other elements
    paddingTop: 40, // Padding to avoid content from sticking to the top
    paddingLeft: 20, // Padding inside the sidebar
    shadowColor: "#000", // Shadow color for sidebar for depth effect
    shadowOffset: { width: 2, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 10, // Shadow radius for soft edges
  },
  closeButton: {
    position: "absolute", // Absolute positioning for the close button
    top: 20, // Top margin
    right: 20, // Right margin
  },
  profileSection: {
    alignItems: "center", // Center the profile section horizontally
    marginBottom: 30, // Bottom margin for spacing
  },
  profileImage: {
    width: 80,  // Customize width
    height: 80, // Customize height
    borderRadius: 40, // Circular border for profile image
  },
  imageFrame: {
    width: 80,  // Size of the frame
    height: 80, // Size of the frame
    borderRadius: 40, // Circular border for the frame
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Frame background color
    borderWidth: 2, // Frame border thickness
    borderColor: "#ddd", // Border color
  },
  profileName: {
    fontSize: 18, // Profile name font size
    fontWeight: "bold", // Make the profile name bold
    marginTop: 10, // Margin between profile icon and name
  },
  menuOptions: {
    marginTop: 20, // Margin for spacing between profile section and menu options
    flex: 1, // Ensure the menu options fill available space
  },
  menuItem: {
    paddingVertical: 15, // Padding for each menu item
    borderBottomWidth: 1, // Border at the bottom of each menu item
    borderBottomColor: "#ddd", // Border color for separation
  },
  menuText: {
    fontSize: 16, // Font size for the menu text
    color: "#333", // Color for menu text
  },
});

export default Sidebar;
