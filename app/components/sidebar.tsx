import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "@/services/authentication/authServices";
import { viewProfile } from "@/services/profile/profileServices";
import renderImage from "@/constants/renderImage/renderImage";

const Sidebar = ({ isVisible, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [activeMenu, setActiveMenu] = useState("/(tabs)/dispatch"); // Default active menu
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await viewProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isVisible) {
      fetchProfile();
    }
  }, [isVisible]);

  useEffect(() => {
    // Retrieve the saved active menu from AsyncStorage on mount
    const getActiveMenu = async () => {
      try {
        const savedActiveMenu = await AsyncStorage.getItem("activeMenu");
        if (savedActiveMenu) {
          setActiveMenu(savedActiveMenu);
        }
      } catch (error) {
        console.error("Error retrieving active menu:", error);
      }
    };
    getActiveMenu();
  
    // Cleanup function to clear the active menu on unmount
    return () => {
      AsyncStorage.removeItem("activeMenu");
    };
  }, []);
  

  const handleMenuClick = async (menu) => {
    try {
      setActiveMenu(menu); // Set the clicked menu item as active
      await AsyncStorage.setItem("activeMenu", menu); // Save the active menu to AsyncStorage
      router.push(menu); // Navigate to the selected menu
    } catch (error) {
      console.error("Error saving active menu:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("activeMenu"); // Clear the active menu on logout
      router.push("/auth/login");
      console.log("Successfully Logged Out");
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
            {profile?.profile?.user_profile_image ? (
              <Image
                source={{
                  uri: `${renderImage}/${profile.profile.user_profile_image}`,
                }}
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
            {/* Dispatch Management */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeMenu === "/(tabs)/dispatch" && styles.activeMenuItem,
              ]}
              onPress={() => handleMenuClick("/(tabs)/dispatch")}
            >
              <Text
                style={[
                  styles.menuText,
                  activeMenu === "/(tabs)/dispatch" && styles.activeMenuText,
                ]}
              >
                Dispatch Management
              </Text>
            </TouchableOpacity>

            {/* Dispatch Setting */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeMenu === "/(tabs)/DispatchSettings" &&
                  styles.activeMenuItem,
              ]}
              onPress={() => handleMenuClick("/(tabs)/DispatchSettings")}
            >
              <Text
                style={[
                  styles.menuText,
                  activeMenu === "/(tabs)/DispatchSettings" &&
                    styles.activeMenuText,
                ]}
              >
                Dispatch Setting
              </Text>
            </TouchableOpacity>

            {/* Profile Settings */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeMenu === "/(tabs)/accountSettings" &&
                  styles.activeMenuItem,
              ]}
              onPress={() => handleMenuClick("/(tabs)/accountSettings")}
            >
              <Text
                style={[
                  styles.menuText,
                  activeMenu === "/(tabs)/accountSettings" &&
                    styles.activeMenuText,
                ]}
              >
                Account Settings
              </Text>
            </TouchableOpacity>

          </View>
            {/* Logout */}
            
            <View style={styles.logoutContainer}>
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
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width * 0.6,
    height: "110%",
    backgroundColor: "#f5f5f5",
    zIndex: 1000,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    borderWidth: 2,
    borderColor: "#333",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuOptions: {
    marginTop: 20,
    flex: 4,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    marginLeft: 20,
    fontSize: 16,
    color: "#333",
  },
  activeMenuItem: {
    backgroundColor: "#e0e0e0",
  },
  activeMenuText: {
    marginLeft: 35,
    color: "#007BFF",
    fontWeight: "bold",
  },
  logoutContainer:{
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  }
});

export default Sidebar;