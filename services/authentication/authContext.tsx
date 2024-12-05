import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, login, logout } from "@/services/authentication/authServices";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const userData = await getUser(); // Fetch user details from API
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (username, password) => {
    try {
      const response = await login(username, password); // Call login API

      // Check if response contains a valid token and role
      if (response?.token && response?.user?.role?.role_id === 2) {

        // Set user state with the response user object
        setUser(response.user);

        return response.user; // Return user data to caller
      } else {
        // If role is not dispatcher (role_id = 2), throw an error
        throw new Error("Access Denied: Only dispatchers are allowed.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      await logout(); // Clear server session
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
