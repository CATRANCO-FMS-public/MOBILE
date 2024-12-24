import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "@/services/authentication/authServices";
import { viewProfile } from "@/services/profile/profileServices";
import renderImage from "@/constants/renderImage/renderImage";
import { useFocusEffect } from "expo-router";

const Sidebar = ({ isVisible, onClose }) => {
  const [username, setUsername] = useState(null);
  const [activeMenu, setActiveMenu] = useState("/(tabs)/dispatch"); // Default active menu
  const [imageUrl, setImageUrl] = useState(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          const profileData = await viewProfile();
          if (profileData?.profile?.user_profile_image) {
            const userProfileImage = profileData.profile.user_profile_image;
            await AsyncStorage.setItem("userProfileImage", userProfileImage);
            setImageUrl(userProfileImage);
          }
          const username = profileData?.user?.username || "User";
          await AsyncStorage.setItem("username", username);
          setUsername(username);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };

      fetchProfile();
    }, [])
  );

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

    const getProfileData = async () => {
      try {
        const savedImage = await AsyncStorage.getItem("userProfileImage");
        const savedUsername = await AsyncStorage.getItem("username");

        if (savedImage) {
          setImageUrl(savedImage);
        }
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Error retrieving profile data:", error);
      }
    };
    getProfileData();
  
    // Cleanup function to clear the active menu on unmount
    return () => {
      AsyncStorage.removeItem("activeMenu");
      setActiveMenu("/(tabs)/dispatch");
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
    setLogoutModalVisible(true); // Show the logout confirmation modal
  };

  const confirmLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("activeMenu"); // Clear the active menu on logout
      router.push("/auth/login");
      console.log("Successfully Logged Out");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setLogoutModalVisible(false); // Close the modal after logging out
  };

  const closeLogoutModal = () => {
    setLogoutModalVisible(false); // Close the modal without logging out
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
             {imageUrl ? (
              <Image
                source={{
                  uri: `${renderImage}/${imageUrl}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imageFrame}>
                <Icon name="person-circle-outline" size={50} color="gray" />
              </View>
            )}
            <Text style={styles.profileName}>{username || "User"}</Text>
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
              <View style={[styles.menuTextContainer, activeMenu === "/(tabs)/dispatch" && styles.activeMenuTextContainer]}>
                <Icon
                  name="navigate"
                  size={20}
                  color={activeMenu === "/(tabs)/dispatch" ? "#3b82f6" : "#333"}
                  style={[styles.menuIcon, activeMenu === "/(tabs)/dispatch" && styles.activeMenuIcon]}
                />
                <Text
                  style={[
                    styles.menuText,
                    activeMenu === "/(tabs)/dispatch" && styles.activeMenuText,
                  ]}
                >
                  Dispatch Management
                </Text>
              </View>
            </TouchableOpacity>

            {/* Dispatch Setting */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeMenu === "/(tabs)/DispatchSettings" && styles.activeMenuItem,
              ]}
              onPress={() => handleMenuClick("/(tabs)/DispatchSettings")}
            >
              <View style={[styles.menuTextContainer, activeMenu === "/(tabs)/DispatchSettings" && styles.activeMenuTextContainer]}>
                <Icon
                  name="settings"
                  size={20}
                  color={activeMenu === "/(tabs)/DispatchSettings" ? "#3b82f6" : "#333"}
                  style={[styles.menuIcon, activeMenu === "/(tabs)/DispatchSettings" && styles.activeMenuIcon]}
                />
                <Text
                  style={[
                    styles.menuText,
                    activeMenu === "/(tabs)/DispatchSettings" && styles.activeMenuText,
                  ]}
                >
                  Dispatch Setting
                </Text>
              </View>
            </TouchableOpacity>

            {/* Profile Settings */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeMenu === "/(tabs)/accountSettings" && styles.activeMenuItem,
              ]}
              onPress={() => handleMenuClick("/(tabs)/accountSettings")}
            >
              <View style={[styles.menuTextContainer, activeMenu === "/(tabs)/accountSettings" && styles.activeMenuTextContainer]}>
                <Icon
                  name="person"
                  size={20}
                  color={activeMenu === "/(tabs)/accountSettings" ? "#3b82f6" : "#333"}
                  style={[styles.menuIcon, activeMenu === "/(tabs)/accountSettings" && styles.activeMenuIcon]}
                />
                <Text
                  style={[
                    styles.menuText,
                    activeMenu === "/(tabs)/accountSettings" && styles.activeMenuText,
                  ]}
                >
                  Account Settings
                </Text>
              </View>
            </TouchableOpacity>

          </View>

          {/* Logout */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuTextContainer}>
                <Icon
                  name="log-out-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Logout Confirmation Modal */}
          <Modal
            visible={isLogoutModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeLogoutModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
                <View style={styles.resetButtonContainer}>
                  <TouchableOpacity
                    onPress={confirmLogout}
                    style={[styles.modalOption, styles.resetButtonYes]}
                  >
                    <Text style={[styles.modalText, { color: "#fff" }]}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={closeLogoutModal}
                    style={[styles.modalOption, styles.resetButtonNo]}
                  >
                    <Text style={[styles.modalText, { color: "#fff" }]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    height: Dimensions.get("window").height,
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
    flex: 3,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  menuIcon: {
    marginLeft: 15,
  },
  activeMenuItem: {
    backgroundColor: "#e0e0e0",
  },
  activeMenuTextContainer: {
    marginLeft: 15,
  },
  activeMenuText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  activeMenuIcon: {
    color: "#3b82f6",
  },
  logoutContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resetButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  resetButtonYes: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#4CAF50", // Green for "Yes"
  },
  resetButtonNo: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#F44336", // Red for "No"
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#f7f7f7",
    width: "100%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "black",
  },
});

export default Sidebar;
