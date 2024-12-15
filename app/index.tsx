import React, { useEffect, useContext } from "react";
import { View, Image, Dimensions, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AuthContext } from "@/services/authentication/authContext";

export default function SplashScreen() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until auth state is resolved

    const timeout = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)/dispatch"); // Navigate to authenticated screen
      } else {
        router.replace("/auth/login"); // Navigate to login screen
      }
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(timeout); // Cleanup timeout on component unmount
  }, [user, loading]);

  const { width, height } = Dimensions.get("window");

  return (
    <LinearGradient
      colors={["#4299E1", "#F56565"]}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/catranco_logo.png")}
        style={{
          width: width * 0.8,
          height: height * 0.4,
        }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
    </LinearGradient>
  );
}
